from rest_framework.generics import (
    ListAPIView,
    RetrieveAPIView,
    CreateAPIView,
    UpdateAPIView,
    DestroyAPIView,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Product
from .serializers import ProductSerializer, ProductPriceUpdateSerializer
from .permissions import IsSellerOwnerOrReadOnly


class ProductListView(ListAPIView):
    """Public — anyone can browse all active products."""
    serializer_class = ProductSerializer
    queryset = Product.objects.filter(is_active=True)
    permission_classes = []  # public


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


# products/views.py
from users.permissions import IsVerifiedSeller  # import from users app


class ProductCreateView(CreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsVerifiedSeller] 
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_context(self):
        return {'request': self.request}

class ProductUpdateView(UpdateAPIView):
    """Full edit — name, description, price, stock, image."""
    serializer_class = ProductSerializer
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticated, IsSellerOwnerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]
    http_method_names = ['get', 'put', 'patch']


class ProductPriceUpdateView(UpdateAPIView):
    """Quick price-only update — lighter payload than full edit."""
    serializer_class = ProductPriceUpdateSerializer
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticated, IsSellerOwnerOrReadOnly]
    http_method_names = ['patch']


class ProductDeleteView(DestroyAPIView):
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticated, IsSellerOwnerOrReadOnly]