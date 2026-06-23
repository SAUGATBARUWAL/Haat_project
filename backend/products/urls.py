from django.urls import path
from . import views

urlpatterns = [
    path('', views.ProductListView.as_view(), name='product-list'),
    path('<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),

    path('mine/', views.MyProductListView.as_view(), name='my-products'),
    path('create/', views.ProductCreateView.as_view(), name='product-create'),
    path('<int:pk>/edit/', views.ProductUpdateView.as_view(), name='product-update'),
    path('<int:pk>/price/', views.ProductPriceUpdateView.as_view(), name='product-price-update'),
    path('<int:pk>/delete/', views.ProductDeleteView.as_view(), name='product-delete'),
]