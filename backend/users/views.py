from rest_framework import status
from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import (
    CustomerRegisterSerializer,
    SellerRegisterSerializer,
    CustomTokenObtainPairSerializer,
    UserProfileSerializer,
    SellerProfileSerializer,
    CustomerProfileSerializer,
    CustomerDeliveryDetailsSerializer,
    CustomerProfilePictureSerializer,
)


class CustomerRegisterView(CreateAPIView):
    serializer_class = CustomerRegisterSerializer
    queryset = User.objects.all()
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        return Response(
            {
                "message": "Customer registered successfully.",
                "username": user.username,
            },
            status=status.HTTP_201_CREATED,
        )


class SellerRegisterView(CreateAPIView):
    serializer_class = SellerRegisterSerializer
    queryset = User.objects.all()
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        return Response(
            {
                "message": "Seller registered successfully. Verification pending.",
                "username": user.username,
            },
            status=status.HTTP_201_CREATED,
        )


class CustomerDeliveryDetailsView(RetrieveUpdateAPIView):
    serializer_class = CustomerDeliveryDetailsSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'put', 'patch']  # PUT is fine here since both fields are required anyway

    def get_object(self):
        return self.request.user.customer_profile


class CustomerProfilePictureView(RetrieveUpdateAPIView):
    serializer_class = CustomerProfilePictureSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # needed for file upload
    http_method_names = ['get', 'put', 'patch']

    def get_object(self):
        return self.request.user.customer_profile


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        data = UserProfileSerializer(user).data

        if user.role == "seller":
            seller_profile = getattr(user, "seller_profile", None)

            if seller_profile:
                data["seller_profile"] = SellerProfileSerializer(
                    seller_profile
                ).data

        elif user.role == "customer":
            customer_profile = getattr(user, "customer_profile", None)

            if customer_profile:
                data["customer_profile"] = CustomerProfileSerializer(
                    customer_profile
                ).data

        return Response(data, status=status.HTTP_200_OK)