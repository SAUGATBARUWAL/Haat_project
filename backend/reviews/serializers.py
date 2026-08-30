from rest_framework import serializers
from .models import Review
from orders.models import OrderItem


class ReviewSerializer(serializers.ModelSerializer):

    username = serializers.CharField(source="user.username", read_only=True)

    # product is derived from order_item, never submitted directly —
    # this guarantees the review's product always matches what was
    # actually purchased.
    product = serializers.PrimaryKeyRelatedField(read_only=True)

    order_item = serializers.PrimaryKeyRelatedField(
        queryset=OrderItem.objects.all()
    )

    class Meta:
        model = Review
        fields = [
            "id",
            "user",
            "username",
            "order_item",
            "product",
            "rating",
            "comment",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "username",
            "product",
            "created_at",
            "updated_at",
        ]

    def validate_order_item(self, order_item):

        request = self.context["request"]

        if order_item.order.customer.user != request.user:
            raise serializers.ValidationError(
                "This order item does not belong to you."
            )

        if order_item.order.status != "delivered":
            raise serializers.ValidationError(
                "You can only review items after they've been delivered."
            )

        if hasattr(order_item, "review"):
            raise serializers.ValidationError(
                "You've already reviewed this order item."
            )

        return order_item

    def create(self, validated_data):

        request = self.context["request"]

        validated_data["user"] = request.user
        validated_data["product"] = validated_data["order_item"].product

        return Review.objects.create(**validated_data)