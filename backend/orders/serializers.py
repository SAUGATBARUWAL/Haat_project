from django.db import transaction
from rest_framework import serializers

from cart.models import Cart
from products.models import Product

from .models import Order, OrderItem


# ==========================================================
# ORDER ITEM PRODUCT
# ==========================================================


class OrderItemProductSerializer(serializers.Serializer):

    id = serializers.IntegerField()

    image = serializers.SerializerMethodField()

    def get_image(self, obj):

        primary = (
            obj.images.filter(
                is_primary=True
            ).first()
            or obj.images.first()
        )

        return primary.image if primary else None


# ==========================================================
# ORDER ITEM
# ==========================================================


class OrderItemSerializer(serializers.ModelSerializer):

    product_detail = OrderItemProductSerializer(
        source="product",
        read_only=True,
    )

    product_image = serializers.SerializerMethodField()

    subtotal = serializers.SerializerMethodField()

    order_status = serializers.CharField(
        source="order.status",
        read_only=True,
    )

    class Meta:
        model = OrderItem

        fields = [
            "id",
            "order",
            "product",
            "product_detail",
            "product_name",
            "product_image",

            "original_price_at_purchase",
            "discount_percentage_at_purchase",
            "price_at_purchase",

            "quantity",
            "subtotal",

            "order_status",
        ]

        read_only_fields = fields

    def get_product_image(self, obj):

        if not obj.product:
            return None

        primary = (
            obj.product.images.filter(
                is_primary=True
            ).first()
            or obj.product.images.first()
        )

        return primary.image if primary else None

    def get_subtotal(self, obj):

        return obj.subtotal()


# ==========================================================
# RIDER
# ==========================================================


class OrderRiderSerializer(serializers.Serializer):

    id = serializers.IntegerField()

    full_name = serializers.CharField()

    phone = serializers.CharField()

    @staticmethod
    def from_rider(rider):

        return {
            "id": rider.id,
            "full_name": rider.full_name,
            "phone": rider.user.phone or "",
        }


# ==========================================================
# ORDER
# ==========================================================


class OrderSerializer(serializers.ModelSerializer):

    items = OrderItemSerializer(
        many=True,
        read_only=True,
    )

    customer_username = serializers.CharField(
        source="customer.user.username",
        read_only=True,
    )

    assigned_rider = serializers.SerializerMethodField()

    class Meta:
        model = Order

        fields = [
            "id",
            "customer_username",
            "assigned_rider",
            "status",

            "payment_method",
            "payment_status",

            "delivery_phone",
            "delivery_address",

            "items",

            "total_price",

            "created_at",
            "updated_at",
        ]

        read_only_fields = fields

    def get_assigned_rider(self, obj):

        if not obj.assigned_rider:
            return None

        return OrderRiderSerializer.from_rider(
            obj.assigned_rider
        )


# ==========================================================
# CHECKOUT
# ==========================================================

class CheckoutSerializer(serializers.Serializer):

    phone = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=15,
    )

    address = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    payment_method = serializers.ChoiceField(
        choices=Order.PAYMENT_CHOICES,
    )

    def validate(self, attrs):

        request = self.context.get("request")

        # --------------------------------------------------
        # AUTHENTICATION CHECK
        # --------------------------------------------------

        if not request:
            raise serializers.ValidationError(
                "Request context is missing."
            )

        user = request.user

        print("\n========== CHECKOUT DEBUG ==========")
        print("USER:", user)
        print("USER ID:", getattr(user, "id", None))
        print(
            "AUTHENTICATED:",
            getattr(user, "is_authenticated", False)
        )

        if not user.is_authenticated:

            print("ERROR: USER IS NOT AUTHENTICATED")
            print("====================================\n")

            raise serializers.ValidationError(
                "Authentication required."
            )

        # --------------------------------------------------
        # CUSTOMER PROFILE
        # --------------------------------------------------

        try:

            customer = user.customer_profile

        except Exception as exc:

            print(
                "CUSTOMER PROFILE ERROR:",
                repr(exc)
            )

            print("====================================\n")

            raise serializers.ValidationError(
                "Customer profile not found."
            )

        print(
            "CUSTOMER PROFILE ID:",
            customer.id
        )

        # --------------------------------------------------
        # CART
        # --------------------------------------------------

        try:

            cart = (
                Cart.objects
                .prefetch_related(
                    "items__product"
                )
                .get(
                    customer=customer
                )
            )

        except Cart.DoesNotExist:

            print("CART DOES NOT EXIST")

            print("====================================\n")

            raise serializers.ValidationError(
                "Your cart is empty."
            )

        # --------------------------------------------------
        # CART ITEMS
        # --------------------------------------------------

        cart_items = list(
            cart.items.all()
        )

        print(
            "CART ID:",
            cart.id
        )

        print(
            "CART ITEM COUNT:",
            len(cart_items)
        )

        for cart_item in cart_items:

            print(
                "CART ITEM:",
                cart_item.id,
                "| PRODUCT:",
                cart_item.product_id,
                "| QTY:",
                cart_item.quantity,
            )

        # --------------------------------------------------
        # EMPTY CART
        # --------------------------------------------------

        if not cart_items:

            print(
                "ERROR: CART EXISTS BUT HAS NO ITEMS"
            )

            print("====================================\n")

            raise serializers.ValidationError(
                "Your cart is empty."
            )

        # --------------------------------------------------
        # VALIDATE PRODUCTS
        # --------------------------------------------------

        problems = []

        for item in cart_items:

            product = item.product

            if not product:

                problems.append(
                    "A product in your cart is no longer available."
                )

                continue

            if not product.is_active:

                problems.append(
                    f"{product.name} is no longer available."
                )

            elif item.quantity > product.stock:

                problems.append(
                    f"Only {product.stock} of "
                    f"{product.name} left in stock."
                )

        # --------------------------------------------------
        # DELIVERY INFORMATION
        # --------------------------------------------------

        phone = (
            attrs.get("phone")
            or user.phone
        )

        address = (
            attrs.get("address")
            or customer.address
        )

        print(
            "PHONE:",
            phone
        )

        print(
            "ADDRESS:",
            address
        )

        # --------------------------------------------------
        # REQUIRED DELIVERY DATA
        # --------------------------------------------------

        if not phone:

            problems.append(
                "Phone number is required for delivery."
            )

        if not address:

            problems.append(
                "Delivery address is required."
            )

        # --------------------------------------------------
        # VALIDATION ERRORS
        # --------------------------------------------------

        if problems:

            print(
                "CHECKOUT PROBLEMS:",
                problems
            )

            print("====================================\n")

            raise serializers.ValidationError(
                problems
            )

        # --------------------------------------------------
        # SAVE RESOLVED DATA
        # --------------------------------------------------

        attrs["cart"] = cart
        attrs["resolved_phone"] = phone
        attrs["resolved_address"] = address

        print(
            "CHECKOUT VALIDATION SUCCESS"
        )

        print("====================================\n")

        return attrs

    # ======================================================
    # CREATE ORDER
    # ======================================================

    @transaction.atomic
    def create(self, validated_data):

        cart = validated_data["cart"]

        request = self.context["request"]

        user = request.user

        customer = user.customer_profile

        phone = validated_data[
            "resolved_phone"
        ]

        address = validated_data[
            "resolved_address"
        ]

        # --------------------------------------------------
        # CREATE ORDER
        # --------------------------------------------------

        order = Order.objects.create(
            customer=customer,
            payment_method=validated_data[
                "payment_method"
            ],
            delivery_phone=phone,
            delivery_address=address,
        )

        # --------------------------------------------------
        # CREATE ORDER ITEMS
        # --------------------------------------------------

        for cart_item in cart.items.all():

            try:

                product = (
                    Product.objects
                    .select_for_update()
                    .get(
                        pk=cart_item.product_id
                    )
                )

            except Product.DoesNotExist:

                raise serializers.ValidationError(
                    "A product in your cart is no longer available."
                )

            # --------------------------------------------------
            # RE-CHECK PRODUCT
            # --------------------------------------------------

            if not product.is_active:

                raise serializers.ValidationError(
                    f"{product.name} is no longer available."
                )

            if cart_item.quantity > product.stock:

                raise serializers.ValidationError(
                    f"Only {product.stock} of "
                    f"{product.name} left in stock."
                )

            # --------------------------------------------------
            # PRICE SNAPSHOT
            # --------------------------------------------------

            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,

                original_price_at_purchase=(
                    product.price
                ),

                discount_percentage_at_purchase=(
                    product.discount_percentage
                ),

                price_at_purchase=(
                    product.discounted_price
                ),

                quantity=cart_item.quantity,
            )

            # --------------------------------------------------
            # REDUCE STOCK
            # --------------------------------------------------

            product.stock -= cart_item.quantity

            product.save(
                update_fields=["stock"]
            )

        # --------------------------------------------------
        # SAVE PHONE
        # --------------------------------------------------

        if not user.phone:

            user.phone = phone

            user.save(
                update_fields=["phone"]
            )

        # --------------------------------------------------
        # SAVE ADDRESS
        # --------------------------------------------------

        if not customer.address:

            customer.address = address

            customer.save(
                update_fields=["address"]
            )

        # --------------------------------------------------
        # CALCULATE ORDER TOTAL
        # --------------------------------------------------

        order.recalculate_total()

        # --------------------------------------------------
        # CLEAR CART
        # --------------------------------------------------

        cart.items.all().delete()

        return order

# ==========================================================
# ORDER STATUS
# ==========================================================


class OrderStatusUpdateSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = Order

        fields = [
            "status",
        ]


# ==========================================================
# RIDER ORDER STATUS
# ==========================================================


class RiderOrderStatusUpdateSerializer(
    serializers.Serializer
):

    status = serializers.ChoiceField(
        choices=Order.STATUS_CHOICES
    )

    cash_received = serializers.BooleanField(
        required=False,
        default=False,
    )


# ==========================================================
# ASSIGN RIDER
# ==========================================================


class AssignRiderSerializer(serializers.Serializer):

    rider_id = serializers.IntegerField()

    def validate_rider_id(self, value):

        from riders.models import RiderProfile

        try:

            rider = (
                RiderProfile.objects
                .select_related("user")
                .get(
                    id=value,
                    user__is_active=True,
                )
            )

        except RiderProfile.DoesNotExist:

            raise serializers.ValidationError(
                "Rider not found or inactive."
            )

        if rider.availability_status == "busy":

            raise serializers.ValidationError(
                "Rider is currently busy."
            )

        return value