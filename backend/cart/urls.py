from django.urls import path
from . import views

urlpatterns = [
    path('', views.CartView.as_view(), name='cart-detail'),
    path('add/', views.CartItemAddView.as_view(), name='cart-item-add'),
    path('items/<int:pk>/', views.CartItemUpdateView.as_view(), name='cart-item-update'),
    path('items/<int:pk>/remove/', views.CartItemRemoveView.as_view(), name='cart-item-remove'),
    path('clear/', views.CartClearView.as_view(), name='cart-clear'),
]