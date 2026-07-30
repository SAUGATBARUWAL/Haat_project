from rest_framework import serializers
from django.db import transaction
from .models import Order, OrderItem
from products.models import Product


class OrderItemSerializer(serializers.ModelSerializer):
    product_id = serializers.PrimaryKeyRelatedField(
        source='product', queryset=Product.objects.filter(is_active=True), write_only=True
    )

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product_id',
            'product_name',
            'price_at_purchase',
            'quantity',
        ]
        read_only_fields = ['id', 'product_name', 'price_at_purchase']

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")
        return value


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'status',
            'total_price',
            'items',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'status', 'total_price', 'created_at', 'updated_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        customer_profile = self.context['request'].user.customer_profile

        with transaction.atomic():
            order = Order.objects.create(customer=customer_profile)

            for item_data in items_data:
                product = item_data['product']
                if product.stock < item_data['quantity']:
                    raise serializers.ValidationError(
                        {"items": f"Not enough stock for '{product.name}'."}
                    )

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item_data['quantity'],
                )

                # reduce stock
                product.stock -= item_data['quantity']
                product.save(update_fields=['stock'])

            order.recalculate_total()

        return order


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    """For sellers/admins to update order status (e.g. mark as shipped)."""
    class Meta:
        model = Order
        fields = ['status']