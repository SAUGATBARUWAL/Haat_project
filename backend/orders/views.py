import uuid

from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404, redirect

from rest_framework import status
from rest_framework.generics import (
    ListAPIView,
    RetrieveAPIView,
)
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)
from rest_framework.response import Response
from rest_framework.views import APIView

from cart.models import Cart

from riders.permissions import IsRider

from users.permissions import (
    IsAdmin,
    IsCustomer,
)

from .esewa import (
    build_payment_payload,
    check_transaction_status,
    decode_callback,
    verify_payment_for_order,
)

from .models import Order, OrderItem

from .serializers import (
    AssignRiderSerializer,
    CheckoutSerializer,
    OrderItemSerializer,
    OrderSerializer,
    RiderOrderStatusUpdateSerializer,
)


# ==========================================================
# FRONTEND
# ==========================================================

FRONTEND_ORDER_STATUS_URL = getattr(
    settings,
    "FRONTEND_ORDER_STATUS_URL",
    "http://localhost:5173/orders",
)


# ==========================================================
# CUSTOMER ORDER VIEWS
# ==========================================================


class CheckoutView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsCustomer,
    ]

    def post(self, request):

        # ==================================================
        # CHECKOUT DEBUG
        # ==================================================

        print("\n========== CHECKOUT DEBUG ==========")

        print(
            "AUTHENTICATED:",
            request.user.is_authenticated
        )

        print(
            "USER ID:",
            request.user.id
        )

        print(
            "USERNAME:",
            request.user.username
        )

        print(
            "ROLE:",
            getattr(
                request.user,
                "role",
                None
            )
        )

        # --------------------------------------------------
        # CUSTOMER PROFILE
        # --------------------------------------------------

        has_customer_profile = hasattr(
            request.user,
            "customer_profile"
        )

        print(
            "HAS CUSTOMER PROFILE:",
            has_customer_profile
        )

        if has_customer_profile:

            customer = request.user.customer_profile

            print(
                "CUSTOMER PROFILE ID:",
                customer.id
            )

            # --------------------------------------------------
            # CART
            # --------------------------------------------------

            cart = (
                Cart.objects
                .filter(
                    customer=customer
                )
                .prefetch_related(
                    "items__product"
                )
                .first()
            )

            print(
                "CART ID:",
                cart.id if cart else None
            )

            if cart:

                cart_items = list(
                    cart.items.values(
                        "id",
                        "product_id",
                        "quantity",
                    )
                )

                print(
                    "CART ITEMS:",
                    cart_items
                )

                print(
                    "CART ITEM COUNT:",
                    cart.items.count()
                )

            else:

                print(
                    "CART ITEMS: NO CART FOUND"
                )

        else:

            print(
                "CUSTOMER PROFILE: NOT FOUND"
            )

        print(
            "REQUEST DATA:",
            request.data
        )

        print(
            "====================================\n"
        )

        # ==================================================
        # NORMAL CHECKOUT
        # ==================================================

        serializer = CheckoutSerializer(
            data=request.data,
            context={
                "request": request,
            },
        )

        serializer.is_valid(
            raise_exception=True
        )

        order = serializer.save()

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )


class OrderListView(ListAPIView):

    serializer_class = OrderSerializer

    permission_classes = [
        IsAuthenticated,
        IsCustomer,
    ]

    def get_queryset(self):

        return (
            Order.objects
            .filter(
                customer=self.request.user.customer_profile
            )
            .select_related(
                "customer__user",
                "assigned_rider__user",
            )
            .prefetch_related(
                "items__product__images"
            )
        )


class OrderDetailView(RetrieveAPIView):

    serializer_class = OrderSerializer

    permission_classes = [
        IsAuthenticated,
        IsCustomer,
    ]

    def get_queryset(self):

        return (
            Order.objects
            .filter(
                customer=self.request.user.customer_profile
            )
            .select_related(
                "customer__user",
                "assigned_rider__user",
            )
            .prefetch_related(
                "items__product__images"
            )
        )


# ==========================================================
# SELLER ORDER VIEWS
# ==========================================================


class SellerOrderItemListView(ListAPIView):

    serializer_class = OrderItemSerializer

    permission_classes = [
        IsAuthenticated,
    ]

    def get_queryset(self):

        user = self.request.user

        if not (
            user.is_authenticated
            and user.role == "seller"
            and user.is_active
            and hasattr(
                user,
                "seller_profile",
            )
            and user.seller_profile.verification_status
            == "verified"
        ):

            return OrderItem.objects.none()

        return (
            OrderItem.objects
            .filter(
                product__seller=user.seller_profile
            )
            .select_related(
                "order",
                "product",
            )
            .prefetch_related(
                "product__images"
            )
            .order_by(
                "-order__created_at"
            )
        )


class SellerOrderPackagingView(APIView):

    permission_classes = [
        IsAuthenticated,
    ]

    @transaction.atomic
    def patch(self, request, pk):

        user = request.user

        if not (
            user.is_authenticated
            and user.role == "seller"
            and user.is_active
            and hasattr(
                user,
                "seller_profile",
            )
            and user.seller_profile.verification_status
            == "verified"
        ):

            return Response(
                {
                    "detail":
                    "You are not authorized to update orders."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        seller = user.seller_profile

        try:

            order = (
                Order.objects
                .select_for_update()
                .get(pk=pk)
            )

        except Order.DoesNotExist:

            return Response(
                {
                    "detail": "Order not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        seller_has_item = (
            OrderItem.objects
            .filter(
                order=order,
                product__seller=seller,
            )
            .exists()
        )

        if not seller_has_item:

            return Response(
                {
                    "detail":
                    "You are not authorized to update this order."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if order.status != "pending":

            return Response(
                {
                    "detail":
                    f"Cannot change order status from "
                    f"'{order.status}' to 'packaging'."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------------------------
        # ESEWA PAYMENT CHECK
        # --------------------------------------------------

        if (
            order.payment_method == "esewa"
            and order.payment_status != "paid"
        ):

            return Response(
                {
                    "detail":
                    "This eSewa order has not been paid yet."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = "packaging"

        order.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_200_OK,
        )


# ==========================================================
# ADMIN ORDER VIEWS
# ==========================================================


class AdminOrderListView(ListAPIView):

    serializer_class = OrderSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdmin,
    ]

    def get_queryset(self):

        return (
            Order.objects
            .all()
            .select_related(
                "customer__user",
                "assigned_rider__user",
            )
            .prefetch_related(
                "items__product__images"
            )
        )


class AdminOrderDetailView(RetrieveAPIView):

    serializer_class = OrderSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdmin,
    ]

    def get_queryset(self):

        return (
            Order.objects
            .all()
            .select_related(
                "customer__user",
                "assigned_rider__user",
            )
            .prefetch_related(
                "items__product__images"
            )
        )


class AdminAssignRiderView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdmin,
    ]

    @transaction.atomic
    def patch(self, request, pk):

        try:

            order = (
                Order.objects
                .select_for_update()
                .select_related(
                    "assigned_rider__user"
                )
                .get(pk=pk)
            )

        except Order.DoesNotExist:

            return Response(
                {
                    "detail": "Order not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if order.status in [
            "delivered",
            "cancelled",
        ]:

            return Response(
                {
                    "detail":
                    "This order can no longer be assigned."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------------------------
        # ESEWA PAYMENT CHECK
        # --------------------------------------------------

        if (
            order.payment_method == "esewa"
            and order.payment_status != "paid"
        ):

            return Response(
                {
                    "detail":
                    "This eSewa order has not been paid yet."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = AssignRiderSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        from riders.models import RiderProfile

        rider = (
            RiderProfile.objects
            .select_for_update()
            .select_related("user")
            .get(
                pk=serializer.validated_data[
                    "rider_id"
                ]
            )
        )

        if rider.availability_status == "busy":

            return Response(
                {
                    "detail":
                    "Rider is currently busy."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            order.assigned_rider
            and order.assigned_rider != rider
        ):

            order.assigned_rider.availability_status = (
                "available"
            )

            order.assigned_rider.save(
                update_fields=[
                    "availability_status"
                ]
            )

        order.assigned_rider = rider

        order.status = "rider_assigned"

        order.save(
            update_fields=[
                "assigned_rider",
                "status",
                "updated_at",
            ]
        )

        rider.availability_status = "busy"

        rider.save(
            update_fields=[
                "availability_status"
            ]
        )

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_200_OK,
        )


class AdminCancelOrderView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdmin,
    ]

    @transaction.atomic
    def patch(self, request, pk):

        try:

            order = (
                Order.objects
                .select_for_update()
                .select_related(
                    "assigned_rider"
                )
                .get(pk=pk)
            )

        except Order.DoesNotExist:

            return Response(
                {
                    "detail": "Order not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if order.status == "cancelled":

            return Response(
                {
                    "detail":
                    "This order is already cancelled."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if order.status == "delivered":

            return Response(
                {
                    "detail":
                    "A delivered order cannot be cancelled."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = "cancelled"

        order.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        if order.assigned_rider:

            rider = order.assigned_rider

            rider.availability_status = "available"

            rider.save(
                update_fields=[
                    "availability_status"
                ]
            )

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_200_OK,
        )


# ==========================================================
# RIDER ORDER VIEWS
# ==========================================================


class RiderOrderListView(ListAPIView):

    serializer_class = OrderSerializer

    permission_classes = [
        IsAuthenticated,
        IsRider,
    ]

    def get_queryset(self):

        return (
            Order.objects
            .filter(
                assigned_rider=self.request.user.rider_profile
            )
            .exclude(
                status="cancelled"
            )
            .select_related(
                "customer__user",
                "assigned_rider__user",
            )
            .prefetch_related(
                "items__product__images"
            )
        )


class RiderOrderDetailView(RetrieveAPIView):

    serializer_class = OrderSerializer

    permission_classes = [
        IsAuthenticated,
        IsRider,
    ]

    def get_queryset(self):

        return (
            Order.objects
            .filter(
                assigned_rider=self.request.user.rider_profile
            )
            .select_related(
                "customer__user",
                "assigned_rider__user",
            )
            .prefetch_related(
                "items__product__images"
            )
        )


class RiderOrderStatusUpdateView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsRider,
    ]

    ALLOWED_TRANSITIONS = {
        "rider_assigned": [
            "out_for_delivery"
        ],
        "out_for_delivery": [
            "delivered"
        ],
    }

    @transaction.atomic
    def patch(self, request, pk):

        try:

            order = (
                Order.objects
                .select_for_update()
                .get(
                    pk=pk,
                    assigned_rider=request.user.rider_profile,
                )
            )

        except Order.DoesNotExist:

            return Response(
                {
                    "detail":
                    "Order not found or not assigned to you."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = RiderOrderStatusUpdateSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        new_status = serializer.validated_data[
            "status"
        ]

        cash_received = serializer.validated_data[
            "cash_received"
        ]

        allowed_statuses = self.ALLOWED_TRANSITIONS.get(
            order.status,
            []
        )

        if new_status not in allowed_statuses:

            return Response(
                {
                    "detail":
                    f"Cannot change order status "
                    f"from '{order.status}' "
                    f"to '{new_status}'."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        update_fields = [
            "status",
            "updated_at",
        ]

        # --------------------------------------------------
        # ESEWA ORDERS
        # --------------------------------------------------

        if (
            order.payment_method == "esewa"
            and order.payment_status != "paid"
        ):

            return Response(
                {
                    "detail":
                    "This eSewa order has not been paid."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------------------------
        # COD
        # --------------------------------------------------

        if (
            new_status == "delivered"
            and order.payment_method == "cod"
            and order.payment_status != "paid"
        ):

            if not cash_received:

                return Response(
                    {
                        "detail": (
                            "Please confirm you have collected "
                            "the cash before marking this order "
                            "delivered."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            order.payment_status = "paid"

            update_fields.append(
                "payment_status"
            )

        # --------------------------------------------------
        # UPDATE ORDER
        # --------------------------------------------------

        order.status = new_status

        order.save(
            update_fields=update_fields
        )

        # --------------------------------------------------
        # RIDER AVAILABLE AFTER DELIVERY
        # --------------------------------------------------

        if new_status == "delivered":

            rider = request.user.rider_profile

            rider.availability_status = "available"

            rider.save(
                update_fields=[
                    "availability_status"
                ]
            )

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_200_OK,
        )


# ==========================================================
# ESEWA PAYMENT
# ==========================================================


class EsewaInitiatePaymentView(APIView):
    """
    Starts an eSewa payment for an existing order.

    The frontend sends only the order ID.

    The backend:

        1. Verifies the order belongs to the customer.
        2. Verifies the order uses eSewa.
        3. Creates a transaction UUID if necessary.
        4. Builds the signed eSewa payment payload.

    The frontend then creates a normal HTML POST form
    and submits it directly to eSewa.
    """

    permission_classes = [
        IsAuthenticated,
        IsCustomer,
    ]

    def post(self, request, order_id):

        # --------------------------------------------------
        # GET CUSTOMER ORDER
        # --------------------------------------------------

        order = get_object_or_404(
            Order,
            pk=order_id,
            customer=request.user.customer_profile,
        )

        # --------------------------------------------------
        # VERIFY PAYMENT METHOD
        # --------------------------------------------------

        if order.payment_method != "esewa":

            return Response(
                {
                    "detail": (
                        "This order isn't set up "
                        "for eSewa payment."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------------------------
        # ALREADY PAID
        # --------------------------------------------------

        if order.payment_status == "paid":

            return Response(
                {
                    "detail": (
                        "This order has already been paid."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------------------------
        # CREATE TRANSACTION UUID
        # --------------------------------------------------

        if not order.transaction_uuid:

            order.transaction_uuid = str(
                uuid.uuid4()
            )

            order.save(
                update_fields=[
                    "transaction_uuid"
                ]
            )

        # --------------------------------------------------
        # BUILD ESEWA PAYMENT PAYLOAD
        # --------------------------------------------------

        payment_payload = build_payment_payload(
            order
        )

        return Response(
            payment_payload,
            status=status.HTTP_200_OK,
        )


class EsewaVerifyPaymentView(APIView):
    """
    Handles the callback from eSewa.

    eSewa redirects the customer's browser here after
    the payment attempt.

    The backend:

        1. Decodes the eSewa callback.
        2. Finds the order using transaction_uuid.
        3. Prevents duplicate processing.
        4. Verifies the callback signature.
        5. Confirms the transaction with eSewa.
        6. Marks the order as paid only after successful
           verification.
        7. Redirects the customer back to React.
    """

    permission_classes = [
        AllowAny,
    ]

    @transaction.atomic
    def get(self, request):

        # --------------------------------------------------
        # FRONTEND URLS
        # --------------------------------------------------

        frontend_orders_url = (
            "http://localhost:5173/orders"
        )

        frontend_payment_failed_url = (
            "http://localhost:5173/payment-failed"
        )

        # --------------------------------------------------
        # GET ESEWA CALLBACK DATA
        # --------------------------------------------------

        data_param = request.query_params.get(
            "data"
        )

        if not data_param:

            return redirect(
                frontend_payment_failed_url
            )

        # --------------------------------------------------
        # DECODE CALLBACK
        # --------------------------------------------------

        payload = decode_callback(
            data_param
        )

        if not payload:

            return redirect(
                frontend_payment_failed_url
            )

        # --------------------------------------------------
        # GET TRANSACTION UUID
        # --------------------------------------------------

        transaction_uuid = payload.get(
            "transaction_uuid"
        )

        if not transaction_uuid:

            return redirect(
                frontend_payment_failed_url
            )

        # --------------------------------------------------
        # FIND ORDER
        # --------------------------------------------------

        try:

            order = (
                Order.objects
                .select_for_update()
                .get(
                    transaction_uuid=transaction_uuid
                )
            )

        except Order.DoesNotExist:

            return redirect(
                frontend_payment_failed_url
            )

        # --------------------------------------------------
        # ALREADY PAID
        # --------------------------------------------------

        if order.payment_status == "paid":

            return redirect(
                f"{frontend_orders_url}/"
                f"{order.id}?payment=success"
            )

        # --------------------------------------------------
        # VERIFY CALLBACK
        # --------------------------------------------------

        if not verify_payment_for_order(
            payload,
            order,
        ):

            return redirect(
                f"{frontend_payment_failed_url}"
                f"?order_id={order.id}"
            )

        # --------------------------------------------------
        # SERVER-TO-SERVER VERIFICATION
        # --------------------------------------------------

        status_check = check_transaction_status(
            order
        )

        if not status_check.get("success"):

            return redirect(
                f"{frontend_payment_failed_url}"
                f"?order_id={order.id}"
            )

        # --------------------------------------------------
        # MARK PAYMENT AS PAID
        # --------------------------------------------------

        order.payment_status = "paid"

        order.transaction_code = (
            status_check.get("ref_id")
            or payload.get(
                "transaction_code",
                "",
            )
        )

        order.save(
            update_fields=[
                "payment_status",
                "transaction_code",
            ]
        )

        # --------------------------------------------------
        # SUCCESS
        # --------------------------------------------------

        return redirect(
            f"{frontend_orders_url}/"
            f"{order.id}?payment=success"
        )