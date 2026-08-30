from django.contrib import admin

from .models import (
    Product,
    Category,
    ProductImage,
    ProductSize,
)


# ============================================================
# CATEGORY ADMIN
# ============================================================


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):

    list_display = [
        "name",
        "slug",
    ]

    prepopulated_fields = {
        "slug": ("name",),
    }

    search_fields = [
        "name",
    ]


# ============================================================
# PRODUCT IMAGE INLINE
# ============================================================


class ProductImageInline(admin.TabularInline):

    model = ProductImage

    extra = 0


# ============================================================
# PRODUCT SIZE INLINE
# ============================================================


class ProductSizeInline(admin.TabularInline):

    model = ProductSize

    extra = 0


# ============================================================
# PRODUCT ADMIN
# ============================================================


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):

    list_display = [
        "name",
        "seller",
        "price",
        "discount_percentage",
        "stock",
        "is_active",
        "created_at",
    ]

    list_filter = [
        "is_active",
        "categories",
    ]

    search_fields = [
        "name",
        "description",
    ]

    filter_horizontal = [
        "categories",
    ]

    inlines = [
        ProductImageInline,
        ProductSizeInline,
    ]