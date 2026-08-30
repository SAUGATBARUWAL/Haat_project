from django.db.models import Q

from rest_framework.generics import (
    ListAPIView,
    RetrieveAPIView,
    CreateAPIView,
    UpdateAPIView,
    DestroyAPIView,
)

from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import (
    JSONParser,
    MultiPartParser,
    FormParser,
)

from .models import Product, Category

from .serializers import (
    CategorySerializer,
    ProductSerializer,
    ProductPriceUpdateSerializer,
    ProductStatusUpdateSerializer,
)

from users.permissions import (
    IsVerifiedSeller,
    IsAdmin,
)


class ProductPagination(PageNumberPagination):

    page_size = 12

    page_size_query_param = "page_size"

    max_page_size = 48


# ============================================================
# CATEGORIES
# ============================================================


class CategoryListView(ListAPIView):
    """
    Public category list.
    """

    queryset = Category.objects.all()

    serializer_class = CategorySerializer

    permission_classes = []


class CategoryCreateView(CreateAPIView):
    """
    Verified sellers can create categories.
    """

    queryset = Category.objects.all()

    serializer_class = CategorySerializer

    permission_classes = [
        IsAuthenticated,
        IsVerifiedSeller,
    ]


# ============================================================
# PUBLIC PRODUCTS
# ============================================================


class ProductListView(ListAPIView):
    """
    Public product listing.

    Supports:

    ?category=electronics
    ?seller=5
    ?search=phone
    ?page=2
    ?page_size=24
    """

    serializer_class = ProductSerializer

    permission_classes = []

    pagination_class = ProductPagination

    def get_queryset(self):

        queryset = (
            Product.objects
            .filter(is_active=True)
            .select_related("seller")
            .prefetch_related(
                "categories",
                "images",
                "sizes",
            )
        )

        category_slug = (
            self.request.query_params.get(
                "category"
            )
        )

        if category_slug:

            queryset = queryset.filter(
                categories__slug=category_slug
            )

        seller_id = (
            self.request.query_params.get(
                "seller"
            )
        )

        if seller_id:

            queryset = queryset.filter(
                seller_id=seller_id
            )

        search = (
            self.request.query_params.get(
                "search"
            )
        )

        if search:

            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
            )

        return queryset.distinct()


class ProductDetailView(RetrieveAPIView):
    """
    Public active product detail.
    """

    serializer_class = ProductSerializer

    permission_classes = []

    def get_queryset(self):

        return (
            Product.objects
            .filter(is_active=True)
            .select_related("seller")
            .prefetch_related(
                "categories",
                "images",
                "sizes",
            )
        )


# ============================================================
# SELLER PRODUCTS
# ============================================================


class MyProductListView(ListAPIView):
    """
    Return products owned by the logged-in seller.
    """

    serializer_class = ProductSerializer

    permission_classes = [
        IsAuthenticated,
        IsVerifiedSeller,
    ]

    def get_queryset(self):

        return (
            Product.objects
            .filter(
                seller=self.request.user.seller_profile
            )
            .select_related("seller")
            .prefetch_related(
                "categories",
                "images",
                "sizes",
            )
        )


class ProductCreateView(CreateAPIView):
    """
    Create a product.

    Requires:
    - authenticated user
    - verified seller
    """

    serializer_class = ProductSerializer

    permission_classes = [
        IsAuthenticated,
        IsVerifiedSeller,
    ]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]


class ProductUpdateView(UpdateAPIView):
    """
    Sellers can update their own products.
    """

    serializer_class = ProductSerializer

    permission_classes = [
        IsAuthenticated,
        IsVerifiedSeller,
    ]

    parser_classes = [
        MultiPartParser,
        FormParser,
        JSONParser,
    ]

    def get_queryset(self):

        return (
            Product.objects
            .filter(
                seller=self.request.user.seller_profile
            )
            .select_related("seller")
            .prefetch_related(
                "categories",
                "images",
                "sizes",
            )
        )


class ProductPriceUpdateView(UpdateAPIView):
    """
    Quick price-only update.
    """

    serializer_class = ProductPriceUpdateSerializer

    permission_classes = [
        IsAuthenticated,
        IsVerifiedSeller,
    ]

    http_method_names = [
        "patch",
    ]

    def get_queryset(self):

        return Product.objects.filter(
            seller=self.request.user.seller_profile
        )


class ProductDeleteView(DestroyAPIView):
    """
    Seller deletes one of their own products.
    """

    serializer_class = ProductSerializer

    permission_classes = [
        IsAuthenticated,
        IsVerifiedSeller,
    ]

    def get_queryset(self):

        return Product.objects.filter(
            seller=self.request.user.seller_profile
        )


# ============================================================
# ADMIN PRODUCTS
# ============================================================


class AdminProductListView(ListAPIView):
    """
    Admin can see all products,
    including inactive products.
    """

    serializer_class = ProductSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdmin,
    ]

    def get_queryset(self):

        return (
            Product.objects
            .all()
            .select_related("seller")
            .prefetch_related(
                "categories",
                "images",
                "sizes",
            )
        )


class AdminProductStatusUpdateView(UpdateAPIView):
    """
    Admin can activate/deactivate products.
    """

    queryset = Product.objects.all()

    serializer_class = ProductStatusUpdateSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdmin,
    ]

    http_method_names = [
        "patch",
    ]


class AdminProductDeleteView(DestroyAPIView):
    """
    Admin can delete any product.
    """

    queryset = Product.objects.all()

    serializer_class = ProductSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdmin,
    ]