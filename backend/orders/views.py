from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from users.permissions import IsCustomer, IsVerifiedSeller
from .models import Order, OrderItem
from .serializers import OrderSerializer, CheckoutSerializer, OrderItemSerializer


class CheckoutView(APIView):
    """POST — converts the logged-in customer's cart into an Order."""
    permission_classes = [IsAuthenticated, IsCustomer]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data, context={"request": request})  # was data={}
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderListView(ListAPIView):
    """GET — the logged-in customer's own order history."""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user.customer_profile)


class OrderDetailView(RetrieveAPIView):
    """GET — a single order, scoped to the logged-in customer so they can't view someone else's order by guessing an id."""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user.customer_profile)


class SellerOrderItemListView(ListAPIView):
    """
    GET — every OrderItem across all orders that belongs to this
    seller's products. Since Order isn't split per seller, this is
    item-level, not order-level — a seller sees their own line items,
    not a full order that might contain another seller's products too.
    """
    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated, IsVerifiedSeller]

    def get_queryset(self):
        return OrderItem.objects.filter(
            product__seller=self.request.user.seller_profile
        ).select_related("order", "product").order_by("-order__created_at")