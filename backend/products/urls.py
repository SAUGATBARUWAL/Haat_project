from django.urls import path

from . import views


urlpatterns = [

    # ========================================================
    # CATEGORIES
    # ========================================================

    path(
        "categories/",
        views.CategoryListView.as_view(),
        name="category-list",
    ),

    path(
        "categories/create/",
        views.CategoryCreateView.as_view(),
        name="category-create",
    ),

    # ========================================================
    # SELLER PRODUCTS
    # ========================================================

    path(
        "mine/",
        views.MyProductListView.as_view(),
        name="my-products",
    ),

    path(
        "create/",
        views.ProductCreateView.as_view(),
        name="product-create",
    ),

    # ========================================================
    # ADMIN PRODUCTS
    # ========================================================

    path(
        "admin/",
        views.AdminProductListView.as_view(),
        name="admin-product-list",
    ),

    path(
        "admin/<int:pk>/status/",
        views.AdminProductStatusUpdateView.as_view(),
        name="admin-product-status",
    ),

    path(
        "admin/<int:pk>/delete/",
        views.AdminProductDeleteView.as_view(),
        name="admin-product-delete",
    ),

    # ========================================================
    # PUBLIC PRODUCTS
    # ========================================================

    path(
        "",
        views.ProductListView.as_view(),
        name="product-list",
    ),

    path(
        "<int:pk>/",
        views.ProductDetailView.as_view(),
        name="product-detail",
    ),

    # ========================================================
    # SELLER PRODUCT MANAGEMENT
    # ========================================================

    path(
        "<int:pk>/edit/",
        views.ProductUpdateView.as_view(),
        name="product-update",
    ),

    path(
        "<int:pk>/price/",
        views.ProductPriceUpdateView.as_view(),
        name="product-price-update",
    ),

    path(
        "<int:pk>/delete/",
        views.ProductDeleteView.as_view(),
        name="product-delete",
    ),
]