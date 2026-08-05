from rest_framework import serializers
from django.db import transaction

from .models import Order, OrderItem
from cart.models import Cart


class OrderItemProductSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    image = serializers.SerializerMethodField()

    def get_image(self, obj):
        primary = obj.images.filter(is_primary=True).first() or obj.images.first()
        return primary.image if primary else None


class OrderItemSerializer(serializers.ModelSerializer):
    product_detail = OrderItemProductSerializer(source="product", read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            "id", "order", "product", "product_detail", "product_name",
            "price_at_purchase", "quantity", "subtotal",
        ]
        read_only_fields = fields

    def get_subtotal(self, obj):
        return obj.subtotal()

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_username = serializers.CharField(source="customer.user.username", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "customer_username", "status", "payment_method",
            "delivery_phone", "delivery_address",
            "items", "total_price", "created_at", "updated_at",
        ]
        read_only_fields = fields


class CheckoutSerializer(serializers.Serializer):
    """
    Reads from the customer's cart, and additionally requires delivery
    phone/address (falling back to the profile's saved values if
    already present) and a payment method choice.
    """
    phone = serializers.CharField(required=False, allow_blank=True, max_length=15)
    address = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.ChoiceField(choices=Order.PAYMENT_CHOICES)

    def validate(self, attrs):
        request = self.context["request"]
        customer = request.user.customer_profile
        cart = Cart.objects.filter(customer=customer).first()

        if not cart or not cart.items.exists():
            raise serializers.ValidationError("Your cart is empty.")

        problems = []
        for item in cart.items.select_related("product"):
            product = item.product
            if not product.is_active:
                problems.append(f"{product.name} is no longer available.")
            elif item.quantity > product.stock:
                problems.append(f"Only {product.stock} of {product.name} left in stock.")

        # Fall back to whatever's already saved on the profile, so
        # customers who filled this in on a previous order don't have
        # to re-type it every time.
        phone = attrs.get("phone") or request.user.phone
        address = attrs.get("address") or customer.address

        if not phone:
            problems.append("Phone number is required for delivery.")
        if not address:
            problems.append("Delivery address is required.")

        if problems:
            raise serializers.ValidationError(problems)

        attrs["cart"] = cart
        attrs["resolved_phone"] = phone
        attrs["resolved_address"] = address
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        cart = validated_data["cart"]
        customer = self.context["request"].user.customer_profile
        phone = validated_data["resolved_phone"]
        address = validated_data["resolved_address"]

        order = Order.objects.create(
            customer=customer,
            payment_method=validated_data["payment_method"],
            delivery_phone=phone,
            delivery_address=address,
        )

        for item in cart.items.select_related("product"):
            product = item.product
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                price_at_purchase=product.price,
                quantity=item.quantity,
            )
            product.stock -= item.quantity
            product.save(update_fields=["stock"])

        # Persist back to the profile if it was missing before, so the
        # next checkout doesn't ask again — but never overwrite an
        # existing value just because this order's form resubmitted it.
        user = self.context["request"].user
        if not user.phone:
            user.phone = phone
            user.save(update_fields=["phone"])
        if not customer.address:
            customer.address = address
            customer.save(update_fields=["address"])

        order.recalculate_total()
        cart.items.all().delete()

        return order


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['status']