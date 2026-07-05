from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from users.models import User

from .models import (
    Product,
    Cart,
    CartItem,
    Order,
    OrderItem
)

from .serializers import (
    ProductSerializer,
    CartSerializer,
    OrderSerializer
)


####################################
# Products
####################################

class ProductListCreateView(generics.ListCreateAPIView):

    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Product.objects.all()
    serializer_class = ProductSerializer


####################################
# Add Product To Cart
####################################

class AddToCartView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):

        return Response(
            {
                "message": "Use POST request"
            }
        )

    def post(self, request):

        user = User.objects.first()

        if not user:

            return Response(

                {
                    "error": "No user found"
                },

                status=status.HTTP_400_BAD_REQUEST

            )

        product_id = request.data.get(
            "product_id"
        )

        quantity = int(
            request.data.get(
                "quantity",
                1
            )
        )

        try:

            product = Product.objects.get(
                id=product_id
            )

        except Product.DoesNotExist:

            return Response(

                {
                    "error": "Product not found"
                },

                status=status.HTTP_404_NOT_FOUND

            )

        cart, created = Cart.objects.get_or_create(

            user=user

        )

        item, created = CartItem.objects.get_or_create(

            cart=cart,

            product=product

        )

        if created:

            item.quantity = quantity

        else:

            item.quantity += quantity

        item.save()

        return Response(

            {
                "message":
                "Product added to cart"
            },

            status=status.HTTP_200_OK

        )


####################################
# View Cart
####################################

class CartView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):

        user = User.objects.first()

        if not user:

            return Response(

                {
                    "error": "No user found"
                },

                status=status.HTTP_400_BAD_REQUEST

            )

        cart, created = Cart.objects.get_or_create(

            user=user

        )

        serializer = CartSerializer(

            cart

        )

        return Response(

            serializer.data

        )


####################################
# Remove Cart Item
####################################

class RemoveCartItemView(APIView):

    permission_classes = [AllowAny]

    def delete(self, request, item_id):

        try:

            item = CartItem.objects.get(

                id=item_id

            )

            item.delete()

            return Response(

                {
                    "message":
                    "Item removed"
                }

            )

        except CartItem.DoesNotExist:

            return Response(

                {
                    "error":
                    "Item not found"
                },

                status=status.HTTP_404_NOT_FOUND

            )

    def get(self, request, item_id):

        return Response(

            {
                "message":
                "Use DELETE request"
            }

        )


####################################
# Create Order
####################################

class CreateOrderView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        user = User.objects.first()

        if not user:

            return Response(

                {
                    "error":
                    "No user found"
                },

                status=status.HTTP_400_BAD_REQUEST

            )

        try:

            cart = Cart.objects.get(

                user=user

            )

        except Cart.DoesNotExist:

            return Response(

                {
                    "error":
                    "Cart not found"
                },

                status=status.HTTP_404_NOT_FOUND

            )

        cart_items = cart.items.all()

        if not cart_items.exists():

            return Response(

                {
                    "error":
                    "Cart is empty"
                },

                status=status.HTTP_400_BAD_REQUEST

            )

        total = 0

        for item in cart_items:

            total += (

                item.product.price *

                item.quantity

            )

        order = Order.objects.create(

            user=user,

            total_price=total

        )

        for item in cart_items:

            OrderItem.objects.create(

                order=order,

                product=item.product,

                quantity=item.quantity,

                price=item.product.price

            )

        cart_items.delete()

        serializer = OrderSerializer(

            order

        )

        return Response(

            serializer.data,

            status=status.HTTP_201_CREATED

        )


####################################
# Order List
####################################

class OrderListView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):

        user = User.objects.first()

        if not user:

            return Response(

                {
                    "error":
                    "No user found"
                },

                status=status.HTTP_400_BAD_REQUEST

            )

        orders = Order.objects.filter(

            user=user

        )

        serializer = OrderSerializer(

            orders,

            many=True

        )

        return Response(

            serializer.data

        )


####################################
# Order Detail
####################################

class OrderDetailView(APIView):

    permission_classes = [AllowAny]

    def get(self, request, order_id):

        try:

            order = Order.objects.get(

                id=order_id

            )

        except Order.DoesNotExist:

            return Response(

                {
                    "error":
                    "Order not found"
                },

                status=status.HTTP_404_NOT_FOUND

            )

        serializer = OrderSerializer(

            order

        )

        return Response(

            serializer.data

        )
