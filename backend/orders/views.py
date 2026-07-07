from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated

from .models import Order
from .serializers import OrderSerializer, OrderStatusUpdateSerializer
from .permissions import IsOrderOwner
from users.permissions import IsAdmin


class OrderListView(ListAPIView):
    """Customer-only — view their own order history."""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user.customer_profile)


class OrderDetailView(RetrieveAPIView):
    """Customer-only — view a single order they own."""
    serializer_class = OrderSerializer
    queryset = Order.objects.all()
    permission_classes = [IsAuthenticated, IsOrderOwner]


class OrderCreateView(CreateAPIView):
    """Customer places a new order with one or more items."""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        return {'request': self.request}


class OrderStatusUpdateView(UpdateAPIView):
    """Admin-only — update order status (e.g. paid, shipped, delivered)."""
    serializer_class = OrderStatusUpdateSerializer
    queryset = Order.objects.all()
    permission_classes = [IsAuthenticated, IsAdmin]
    http_method_names = ['patch']