from django.urls import path
from . import views

urlpatterns = [
    path('', views.WishlistListView.as_view(), name='wishlist-list'),
    path('toggle/', views.WishlistToggleView.as_view(), name='wishlist-toggle'),
    path('<int:pk>/remove/', views.WishlistRemoveView.as_view(), name='wishlist-remove'),
]