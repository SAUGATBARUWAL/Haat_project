from rest_framework import serializers

from .models import Cart, CartItem
from products.models import Product


class CartItemProductSerializer(serializers.ModelSerializer):
    """
    Lightweight product information shown inside the cart.
    Includes the product's discount information.
    """

    image = serializers.SerializerMethodField()

    class Meta:
        model = Product

        fields = [
            "id",
            "name",
            "price",
            "discount_percentage",
            "discounted_price",
            "stock",
            "image",
        ]

        read_only_fields = [
            "id",
            "discounted_price",
            "image",
        ]

    def get_image(self, obj):
        primary = (
            obj.images.filter(is_primary=True).first()
            or obj.images.first()
        )

        return primary.image if primary else None


class CartItemSerializer(serializers.ModelSerializer):

    product_detail = CartItemProductSerializer(
        source="product",
        read_only=True,
    )

    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(
            is_active=True
        )
    )

    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem

        fields = [
            "id",
            "product",
            "product_detail",
            "quantity",
            "subtotal",
            "added_at",
        ]

        read_only_fields = [
            "id",
            "added_at",
        ]

    def get_subtotal(self, obj):
        """
        Calculate subtotal using the discounted
        product price.
        """

        return (
            obj.product.discounted_price
            * obj.quantity
        )

    def validate(self, attrs):

        product = (
            attrs.get("product")
            or getattr(
                self.instance,
                "product",
                None,
            )
        )

        quantity = attrs.get(
            "quantity",
            getattr(
                self.instance,
                "quantity",
                1,
            ),
        )

        if product and quantity > product.stock:
            raise serializers.ValidationError(
                {
                    "quantity": (
                        f"Only {product.stock} "
                        "in stock."
                    )
                }
            )

        return attrs


class CartSerializer(serializers.ModelSerializer):

    items = CartItemSerializer(
        many=True,
        read_only=True,
    )

    total_items = serializers.SerializerMethodField()

    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart

        fields = [
            "id",
            "items",
            "total_items",
            "total_price",
            "updated_at",
        ]

    def get_total_items(self, obj):

        return sum(
            item.quantity
            for item in obj.items.all()
        )

    def get_total_price(self, obj):
        """
        Calculate the cart total using the
        discounted price of each product.
        """

        return sum(
            item.product.discounted_price
            * item.quantity
            for item in obj.items.all()
        )