from django.urls import path

from .views import (
    # Customer
    CheckoutView,
    OrderListView,
    OrderDetailView,

    # Seller
    SellerOrderItemListView,
    SellerOrderPackagingView,

    # Admin
    AdminOrderListView,
    AdminOrderDetailView,
    AdminAssignRiderView,
    AdminCancelOrderView,

    # Rider
    RiderOrderListView,
    RiderOrderDetailView,
    RiderOrderStatusUpdateView,

    # eSewa
    EsewaInitiatePaymentView,
    EsewaVerifyPaymentView,
)


app_name = "orders"


urlpatterns = [

    # =========================================================
    # CUSTOMER
    # =========================================================

    # Create an order from the customer's cart
    path(
        "checkout/",
        CheckoutView.as_view(),
        name="checkout",
    ),

    # Customer's orders
    path(
        "",
        OrderListView.as_view(),
        name="order-list",
    ),

    # Customer's single order
    path(
        "<int:pk>/",
        OrderDetailView.as_view(),
        name="order-detail",
    ),


    # =========================================================
    # SELLER
    # =========================================================

    # Seller sees order items belonging to their products
    path(
        "seller/items/",
        SellerOrderItemListView.as_view(),
        name="seller-order-items",
    ),

    # Seller marks their order item/order as packaging
    path(
        "seller/<int:pk>/packaging/",
        SellerOrderPackagingView.as_view(),
        name="seller-order-packaging",
    ),


    # =========================================================
    # ADMIN
    # =========================================================

    # Admin sees all orders
    path(
        "admin/",
        AdminOrderListView.as_view(),
        name="admin-order-list",
    ),

    # Admin sees a specific order
    path(
        "admin/<int:pk>/",
        AdminOrderDetailView.as_view(),
        name="admin-order-detail",
    ),

    # Admin assigns a rider
    path(
        "admin/<int:pk>/assign-rider/",
        AdminAssignRiderView.as_view(),
        name="admin-assign-rider",
    ),

    # Admin cancels an order
    path(
        "admin/<int:pk>/cancel/",
        AdminCancelOrderView.as_view(),
        name="admin-cancel-order",
    ),


    # =========================================================
    # RIDER
    # =========================================================

    # Rider's assigned orders
    path(
        "rider/",
        RiderOrderListView.as_view(),
        name="rider-order-list",
    ),

    # Rider's single assigned order
    path(
        "rider/<int:pk>/",
        RiderOrderDetailView.as_view(),
        name="rider-order-detail",
    ),

    # Rider updates delivery status
    path(
        "rider/<int:pk>/status/",
        RiderOrderStatusUpdateView.as_view(),
        name="rider-order-status-update",
    ),


    # =========================================================
    # ESEWA
    # =========================================================

    # Generate eSewa payment payload for an existing order
    #
    # POST:
    # /orders/<order_id>/esewa/initiate/
    #
    path(
        "<int:order_id>/esewa/initiate/",
        EsewaInitiatePaymentView.as_view(),
        name="esewa-initiate",
    ),

    # eSewa redirects the browser here after payment.
    #
    # GET:
    # /orders/esewa/verify/?data=...
    #
    path(
        "esewa/verify/",
        EsewaVerifyPaymentView.as_view(),
        name="esewa-verify",
    ),
]