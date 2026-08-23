from rest_framework import status

from rest_framework.generics import (
    ListAPIView,
    RetrieveAPIView,
)

from rest_framework.views import APIView

from rest_framework.response import Response

from rest_framework.permissions import IsAuthenticated

from django.db import transaction

from users.permissions import (
    IsCustomer,
    IsAdmin,
)

from riders.permissions import IsRider

from .models import Order, OrderItem

from .serializers import (
    OrderSerializer,
    CheckoutSerializer,
    OrderItemSerializer,
    OrderStatusUpdateSerializer,
    AssignRiderSerializer,
)


class CheckoutView(APIView):

    """
    Customer converts their cart into an order.
    """

    permission_classes = [
        IsAuthenticated,
        IsCustomer,
    ]

    def post(self, request):

        serializer = CheckoutSerializer(
            data=request.data,
            context={"request": request},
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

    """
    Customer sees their own orders.
    """

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

    """
    Customer sees one of their own orders.
    """

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


class SellerOrderItemListView(ListAPIView):

    """
    Seller sees only order items belonging
    to their own products.
    """

    serializer_class = OrderItemSerializer

    permission_classes = [
        IsAuthenticated,
    ]

    def get_queryset(self):

        from users.permissions import IsVerifiedSeller

        # Permission checking is handled below.
        if not (
            self.request.user.is_authenticated
            and self.request.user.role == "seller"
            and self.request.user.is_active
            and hasattr(
                self.request.user,
                "seller_profile",
            )
            and self.request.user.seller_profile.verification_status
            == "verified"
        ):
            return OrderItem.objects.none()

        return (
            OrderItem.objects
            .filter(
                product__seller=self.request.user.seller_profile
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


class AdminOrderListView(ListAPIView):

    """
    Admin sees all orders.
    """

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

    """
    Admin can inspect a specific order.
    """

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

    """
    Admin assigns a verified rider to an order.
    """

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
                {"detail": "Order not found."},
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

        serializer = AssignRiderSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        from riders.models import RiderProfile

        rider = RiderProfile.objects.select_related(
            "user"
        ).get(
            pk=serializer.validated_data["rider_id"]
        )

        # If another rider was assigned,
        # make that rider available again.
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


class RiderOrderListView(ListAPIView):

    """
    Rider sees only orders assigned to them.
    """

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

    """
    Rider sees details of their assigned order.
    """

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

    """
    Rider updates the delivery status of
    their assigned order.
    """

    permission_classes = [
        IsAuthenticated,
        IsRider,
    ]

    ALLOWED_TRANSITIONS = {
        "rider_assigned": [
            "out_for_delivery",
        ],
        "out_for_delivery": [
            "delivered",
        ],
    }

    @transaction.atomic
    def patch(self, request, pk):

        try:
            order = Order.objects.select_for_update().get(
                pk=pk,
                assigned_rider=self.request.user.rider_profile,
            )

        except Order.DoesNotExist:

            return Response(
                {
                    "detail":
                    "Order not found or not assigned to you."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = OrderStatusUpdateSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        new_status = serializer.validated_data[
            "status"
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

        order.status = new_status

        order.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        # Rider becomes available again after delivery.
        if new_status == "delivered":

            rider = (
                self.request.user.rider_profile
            )

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