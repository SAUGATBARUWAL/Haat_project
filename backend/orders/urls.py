from django.urls import path

from . import views


urlpatterns = [

    # -------------------------
    # Customer
    # -------------------------

    path(
        "checkout/",
        views.CheckoutView.as_view(),
        name="checkout",
    ),

    path(
        "",
        views.OrderListView.as_view(),
        name="order-list",
    ),

    path(
        "<int:pk>/",
        views.OrderDetailView.as_view(),
        name="order-detail",
    ),


    # -------------------------
    # Seller
    # -------------------------

    path(
        "seller/items/",
        views.SellerOrderItemListView.as_view(),
        name="seller-order-items",
    ),


    # -------------------------
    # Admin
    # -------------------------

    path(
        "admin/",
        views.AdminOrderListView.as_view(),
        name="admin-order-list",
    ),

    path(
        "admin/<int:pk>/",
        views.AdminOrderDetailView.as_view(),
        name="admin-order-detail",
    ),

    path(
        "admin/<int:pk>/assign-rider/",
        views.AdminAssignRiderView.as_view(),
        name="admin-assign-rider",
    ),


    # -------------------------
    # Rider
    # -------------------------

    path(
        "rider/",
        views.RiderOrderListView.as_view(),
        name="rider-order-list",
    ),

    path(
        "rider/<int:pk>/",
        views.RiderOrderDetailView.as_view(),
        name="rider-order-detail",
    ),

    path(
        "rider/<int:pk>/status/",
        views.RiderOrderStatusUpdateView.as_view(),
        name="rider-order-status",
    ),
]