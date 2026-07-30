from rest_framework import status
from rest_framework.generics import ListAPIView, DestroyAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from users.permissions import IsCustomer
from .models import WishlistItem
from .serializers import WishlistItemSerializer


class WishlistListView(ListAPIView):
    """GET — all products the logged-in customer has wishlisted."""
    serializer_class = WishlistItemSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        return WishlistItem.objects.filter(customer=self.request.user.customer_profile)


class WishlistToggleView(APIView):
    """
    POST {product} — toggles wishlist state for a product: adds it if
    not already there, removes it if it is. Matches the heart-icon
    click pattern (one button, no separate add/remove UI needed).
    """
    permission_classes = [IsAuthenticated, IsCustomer]

    def post(self, request):
        product_id = request.data.get("product")
        if not product_id:
            return Response({"product": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)

        customer = request.user.customer_profile
        existing = WishlistItem.objects.filter(customer=customer, product_id=product_id).first()

        if existing:
            existing.delete()
            return Response({"wishlisted": False}, status=status.HTTP_200_OK)

        serializer = WishlistItemSerializer(data={"product": product_id}, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save(customer=customer)
        return Response({"wishlisted": True, "item": serializer.data}, status=status.HTTP_201_CREATED)


class WishlistRemoveView(DestroyAPIView):
    """DELETE a specific wishlist item by its id — used if you want an explicit remove button in a wishlist list view, as an alternative to the toggle."""
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        return WishlistItem.objects.filter(customer=self.request.user.customer_profile)