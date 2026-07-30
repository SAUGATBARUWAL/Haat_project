from rest_framework import serializers
from .models import Cart, CartItem
from products.models import Product


class CartItemProductSerializer(serializers.ModelSerializer):
    """Lightweight product snapshot for display inside a cart item — not the full ProductSerializer."""
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "price", "stock", "image"]

    def get_image(self, obj):
        primary = obj.images.filter(is_primary=True).first() or obj.images.first()
        return primary.image if primary else None


class CartItemSerializer(serializers.ModelSerializer):
    product_detail = CartItemProductSerializer(source="product", read_only=True)
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.filter(is_active=True))
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ["id", "product", "product_detail", "quantity", "subtotal", "added_at"]
        read_only_fields = ["id", "added_at"]

    def get_subtotal(self, obj):
        return obj.product.price * obj.quantity

    def validate(self, attrs):
        product = attrs.get("product") or getattr(self.instance, "product", None)
        quantity = attrs.get("quantity", getattr(self.instance, "quantity", 1))
        if product and quantity > product.stock:
            raise serializers.ValidationError(
                {"quantity": f"Only {product.stock} in stock."}
            )
        return attrs


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "items", "total_items", "total_price", "updated_at"]

    def get_total_items(self, obj):
        return sum(item.quantity for item in obj.items.all())

    def get_total_price(self, obj):
        return sum(item.product.price * item.quantity for item in obj.items.all())