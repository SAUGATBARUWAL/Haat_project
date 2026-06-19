from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [

    # Registration
    path('register/customer/', views.CustomerRegisterView.as_view(), name='register-customer'),
    path('register/seller/', views.SellerRegisterView.as_view(), name='register-seller'),

    # Authentication (JWT):- login
    path('login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Profile
    path('profile/', views.ProfileView.as_view(), name='profile'),

    # Customer-specific updates
    path('customer/delivery-details/', views.CustomerDeliveryDetailsView.as_view(), name='customer-delivery-details'),
    path('customer/profile-picture/', views.CustomerProfilePictureView.as_view(), name='customer-profile-picture'),
]