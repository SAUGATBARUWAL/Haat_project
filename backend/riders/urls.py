from django.urls import path

from . import views


urlpatterns = [
    path(
        "",
        views.AdminRiderListCreateView.as_view(),
        name="admin-rider-list-create",
    ),

    path(
        "<int:pk>/",
        views.AdminRiderDetailView.as_view(),
        name="admin-rider-detail",
    ),
]