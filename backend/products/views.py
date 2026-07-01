from rest_framework.generics import (
    ListAPIView,
    RetrieveAPIView,
    CreateAPIView,
    UpdateAPIView,
    DestroyAPIView,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Product, Category
from .serializers import ProductSerializer, ProductPriceUpdateSerializer, CategorySerializer
from .permissions import IsSellerOwnerOrReadOnly
from users.permissions import IsVerifiedSeller


class CategoryListView(ListAPIView):
    """Public — lists all categories, used to populate filters/dropdowns."""
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
    permission_classes = []  # public


class ProductListView(ListAPIView):
    """Public — anyone can browse all active products, optionally filtered by category."""
    serializer_class = ProductSerializer
    permission_classes = []  # public

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(categories__slug=category_slug)
        return queryset.distinct()  # distinct() avoids duplicate rows if a product matches multiple filters


class ProductDetailView(RetrieveAPIView):
    """Public — view a single product."""
    serializer_class = ProductSerializer
    queryset = Product.objects.all()
    permission_classes = []


class MyProductListView(ListAPIView):
    """Seller-only — view just their own products (active + inactive)."""
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Product.objects.filter(seller=self.request.user.seller_profile)


class ProductCreateView(CreateAPIView):
    """Only verified, authenticated sellers can create a product."""
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsVerifiedSeller]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_context(self):
        return {'request': self.request}


class ProductUpdateView(UpdateAPIView):
    """Full edit — name, description, price, stock, categories, image."""
    serializer_class = ProductSerializer
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticated, IsSellerOwnerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]
    http_method_names = ['get', 'put', 'patch']

    def get_serializer_context(self):
        return {'request': self.request}


class ProductPriceUpdateView(UpdateAPIView):
    """Quick price-only update — lighter payload than full edit."""
    serializer_class = ProductPriceUpdateSerializer
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticated, IsSellerOwnerOrReadOnly]
    http_method_names = ['patch']


class ProductDeleteView(DestroyAPIView):
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticated, IsSellerOwnerOrReadOnly]