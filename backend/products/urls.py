from django.urls import path

from .views import (
    ProductListCreateView,
    ProductDetailView,
    AddToCartView,
    CartView,
    RemoveCartItemView,
    CreateOrderView,
    OrderListView,
    OrderDetailView
)

urlpatterns = [

    path(
        'products/',
        ProductListCreateView.as_view()
    ),

    path(
        'products/<int:pk>/',
        ProductDetailView.as_view()
    ),

    path(
        'cart/add/',
        AddToCartView.as_view()
    ),

    path(
        'cart/',
        CartView.as_view()
    ),

    path(
        'cart/remove/<int:item_id>/',
        RemoveCartItemView.as_view()
    ),

    path(
        'orders/create/',
        CreateOrderView.as_view()
    ),

    path(
        'orders/',
        OrderListView.as_view()
    ),

    path(
        'orders/<int:order_id>/',
        OrderDetailView.as_view()
    ),

]