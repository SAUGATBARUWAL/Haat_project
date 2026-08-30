from rest_framework import status
from rest_framework.generics import RetrieveAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from users.permissions import IsCustomer
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer


def get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(customer=user.customer_profile)
    return cart


class CartView(RetrieveAPIView):
    """GET the logged-in customer's cart, auto-creating it if this is their first visit."""
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_object(self):
        return get_or_create_cart(self.request.user)


class CartItemAddView(APIView):
    """
    POST {product, quantity} — adds a product to the cart.
    If the product already exists, increases its quantity.
    """
    permission_classes = [IsAuthenticated, IsCustomer]

    def post(self, request):
        cart = get_or_create_cart(request.user)

        product_id = request.data.get("product")
        quantity = request.data.get("quantity", 1)

        if not product_id:
            return Response(
                {"product": "This field is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response(
                {"quantity": "Quantity must be a valid integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity < 1:
            return Response(
                {"quantity": "Quantity must be at least 1."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing = CartItem.objects.filter(
            cart=cart,
            product_id=product_id
        ).first()

        if existing:
            serializer = CartItemSerializer(
                existing,
                data={"quantity": existing.quantity + quantity},
                partial=True,
                context={"request": request},
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()

        else:
            serializer = CartItemSerializer(
                data={
                    "product": product_id,
                    "quantity": quantity,
                },
                context={"request": request},
            )
            serializer.is_valid(raise_exception=True)
            serializer.save(cart=cart)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

class CartItemUpdateView(UpdateAPIView):
    """PATCH quantity on a specific cart item — e.g. from a quantity stepper in the UI."""
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated, IsCustomer]
    http_method_names = ["patch"]

    def get_queryset(self):
        return CartItem.objects.filter(cart__customer=self.request.user.customer_profile)


class CartItemRemoveView(DestroyAPIView):
    """DELETE a single item from the cart."""
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        return CartItem.objects.filter(cart__customer=self.request.user.customer_profile)


class CartClearView(APIView):
    """POST — empties the entire cart, e.g. after checkout completes."""
    permission_classes = [IsAuthenticated, IsCustomer]

    def post(self, request):
        cart = get_or_create_cart(request.user)
        cart.items.all().delete()
        return Response({"message": "Cart cleared."}, status=status.HTTP_200_OK)