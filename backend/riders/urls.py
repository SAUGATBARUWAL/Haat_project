from django.urls import path

from .views import (
    AdminRiderListCreateView,
    AdminRiderDetailView,
    RiderStatusView,
)


urlpatterns = [
    # Admin: list and create riders
    path(
        "",
        AdminRiderListCreateView.as_view(),
        name="admin-rider-list-create",
    ),

    # Rider: get/update own availability
    path(
        "status/",
        RiderStatusView.as_view(),
        name="rider-status",
    ),

    # Admin: retrieve/update one rider
    path(
        "<int:pk>/",
        AdminRiderDetailView.as_view(),
        name="admin-rider-detail",
    ),
]