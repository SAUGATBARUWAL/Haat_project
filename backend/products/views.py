from django.db.models import Q
from rest_framework.generics import (
    ListAPIView, RetrieveAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Product, Category
from .serializers import CategorySerializer, ProductSerializer, ProductPriceUpdateSerializer
from users.permissions import IsVerifiedSeller


class CategoryListView(ListAPIView):
    """Public — list all categories, used to populate filters/menus on the frontend."""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = []


class ProductListView(ListAPIView):
    """Public — browse active products, optionally filtered by category or search term."""
    serializer_class = ProductSerializer
    permission_classes = []

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)

        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(categories__slug=category_slug)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )

        return queryset.distinct()


class ProductDetailView(RetrieveAPIView):
    """Public — view a single active product."""
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = []


class MyProductListView(ListAPIView):
    """Authenticated sellers — list only the products they own (active or not)."""
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsVerifiedSeller]

    def get_queryset(self):
        return Product.objects.filter(seller=self.request.user.seller_profile)


class ProductCreateView(CreateAPIView):
    """Only verified, authenticated sellers can create a product."""
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsVerifiedSeller]
    parser_classes = [MultiPartParser, FormParser]


class ProductUpdateView(UpdateAPIView):
    """Sellers can update their own products only."""
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsVerifiedSeller]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Product.objects.filter(seller=self.request.user.seller_profile)


class ProductPriceUpdateView(UpdateAPIView):
    """Quick price-only patch endpoint, scoped to the seller's own products."""
    serializer_class = ProductPriceUpdateSerializer
    permission_classes = [IsAuthenticated, IsVerifiedSeller]

    def get_queryset(self):
        return Product.objects.filter(seller=self.request.user.seller_profile)


class ProductDeleteView(DestroyAPIView):
    """Sellers can delete their own products only."""
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsVerifiedSeller]

    def get_queryset(self):
        return Product.objects.filter(seller=self.request.user.seller_profile)