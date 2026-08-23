from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = [
        "product",
        "product_name",
        "price_at_purchase",
        "quantity",
    ]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = [
        "id",
        "customer",
        "assigned_rider",
        "status",
        "payment_method",
        "total_price",
        "created_at",
    ]

    list_filter = [
        "status",
        "payment_method",
        "created_at",
    ]

    search_fields = [
        "customer__user__username",
        "customer__user__email",
        "delivery_phone",
        "delivery_address",
    ]

    list_select_related = [
        "customer",
        "customer__user",
        "assigned_rider",
        "assigned_rider__user",
    ]

    readonly_fields = [
        "total_price",
        "created_at",
        "updated_at",
    ]

    inlines = [
        OrderItemInline,
    ]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):

    list_display = [
        "order",
        "product_name",
        "price_at_purchase",
        "quantity",
        "subtotal",
    ]

    search_fields = [
        "product_name",
        "order__id",
    ]

    readonly_fields = [
        "order",
        "product",
        "product_name",
        "price_at_purchase",
        "quantity",
    ]