from rest_framework import serializers
from .models import WishlistItem
from products.models import Product


class WishlistProductSerializer(serializers.ModelSerializer):
    """Lightweight product snapshot for display in the wishlist — same pattern as CartItemProductSerializer."""
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "price", "stock", "is_active", "image"]

    def get_image(self, obj):
        primary = obj.images.filter(is_primary=True).first() or obj.images.first()
        return primary.image if primary else None


class WishlistItemSerializer(serializers.ModelSerializer):
    product_detail = WishlistProductSerializer(source="product", read_only=True)
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.filter(is_active=True))

    class Meta:
        model = WishlistItem
        fields = ["id", "product", "product_detail", "added_at"]
        read_only_fields = ["id", "added_at"]