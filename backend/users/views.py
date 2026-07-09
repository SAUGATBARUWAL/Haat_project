from rest_framework import status
from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView, DestroyAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import AuthenticationFailed

from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

from .permissions import IsAdmin
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
    ChangePasswordSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
)


# --- Helper to set both JWT cookies on any response ---
def set_auth_cookies(response, user):
    refresh = RefreshToken.for_user(user)
    refresh['role'] = user.role
    refresh['username'] = user.username
    access = str(refresh.access_token)

    response.set_cookie(
        key=settings.AUTH_COOKIE_ACCESS,
        value=access,
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
    )
    response.set_cookie(
        key=settings.AUTH_COOKIE_REFRESH,
        value=str(refresh),
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
    )
    return response


class CustomerRegisterView(CreateAPIView):
    serializer_class = CustomerRegisterSerializer
    queryset = User.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        response = Response(
            {
                "message": "Customer registered successfully.",
                "username": user.username,
            },
            status=status.HTTP_201_CREATED,
        )

        set_auth_cookies(response, user)

        return response


class SellerRegisterView(CreateAPIView):
    serializer_class = SellerRegisterSerializer
    queryset = User.objects.all()
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        response = Response(
            {
                "message": "Seller registered successfully. Verification pending.",
                "username": user.username,
            },
            status=status.HTTP_201_CREATED,
        )

        set_auth_cookies(response, user)

        return response


class CustomerDeliveryDetailsView(RetrieveUpdateAPIView):
    serializer_class = CustomerDeliveryDetailsSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'put', 'patch']

    def get_object(self):
        return self.request.user.customer_profile


class CustomerProfilePictureView(RetrieveUpdateAPIView):
    serializer_class = CustomerProfilePictureSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    http_method_names = ['get', 'put', 'patch']

    def get_object(self):
        return self.request.user.customer_profile


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        access = response.data.pop('access', None)
        refresh = response.data.pop('refresh', None)

        if access:
            response.set_cookie(
                key=settings.AUTH_COOKIE_ACCESS,
                value=access,
                httponly=True,
                secure=settings.AUTH_COOKIE_SECURE,
                samesite=settings.AUTH_COOKIE_SAMESITE,
            )
        if refresh:
            response.set_cookie(
                key=settings.AUTH_COOKIE_REFRESH,
                value=refresh,
                httponly=True,
                secure=settings.AUTH_COOKIE_SECURE,
                samesite=settings.AUTH_COOKIE_SAMESITE,
            )

        return response


# Custom refresh view — reads the refresh token from the cookie
# (not from the request body) and re-sets a fresh access token cookie.
#
# FIXED: previously did `request.data['refresh'] = refresh_token` and
# called super().post(), but request.data is often an immutable QueryDict
# for an empty-body POST, so the mutation silently failed and the
# underlying serializer validation saw no `refresh` field -> 400.
# Now we build the serializer directly with a plain dict we control.
class CustomTokenRefreshView(TokenRefreshView):
    '''def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get(settings.AUTH_COOKIE_REFRESH)
        if not refresh_token:
            raise AuthenticationFailed("Refresh token not found in cookies.")

        serializer = self.get_serializer(data={"refresh": refresh_token})
        serializer.is_valid(raise_exception=True)

        access = serializer.validated_data.get("access")

        response = Response({"message": "Token refreshed."}, status=status.HTTP_200_OK)

        response.set_cookie(
            key=settings.AUTH_COOKIE_ACCESS,
            value=access,
            httponly=True,
            secure=settings.AUTH_COOKIE_SECURE,
            samesite=settings.AUTH_COOKIE_SAMESITE,
        )

        # If ROTATE_REFRESH_TOKENS is enabled, a new refresh token is
        # returned too — re-set that cookie, or the old (now possibly
        # blacklisted) one stays in the browser and the *next* refresh fails.
        new_refresh = serializer.validated_data.get("refresh")
        if new_refresh:
            response.set_cookie(
                key=settings.AUTH_COOKIE_REFRESH,
                value=new_refresh,
                httponly=True,
                secure=settings.AUTH_COOKIE_SECURE,
                samesite=settings.AUTH_COOKIE_SAMESITE,
            )

        return response'''

    def post(self, request, *args, **kwargs):
        print("=== COOKIES RECEIVED ===", request.COOKIES)
        print("=== LOOKING FOR KEY ===", settings.AUTH_COOKIE_REFRESH)

        refresh_token = request.COOKIES.get(settings.AUTH_COOKIE_REFRESH)
        print("=== TOKEN FOUND ===", refresh_token)

        if not refresh_token:
            raise AuthenticationFailed("Refresh token not found in cookies.")

        serializer = self.get_serializer(data={"refresh": refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            print("=== SERIALIZER ERROR ===", serializer.errors)
            raise

        access = serializer.validated_data.get("access")

        response = Response({"message": "Token refreshed."}, status=status.HTTP_200_OK)

        response.set_cookie(
            key=settings.AUTH_COOKIE_ACCESS,
            value=access,
            httponly=True,
            secure=settings.AUTH_COOKIE_SECURE,
            samesite=settings.AUTH_COOKIE_SAMESITE,
        )

        new_refresh = serializer.validated_data.get("refresh")
        if new_refresh:
            response.set_cookie(
                key=settings.AUTH_COOKIE_REFRESH,
                value=new_refresh,
                httponly=True,
                secure=settings.AUTH_COOKIE_SECURE,
                samesite=settings.AUTH_COOKIE_SAMESITE,
            )

        return response


# Logout view — clears both cookies. JWTs are stateless, so this doesn't
# invalidate the token server-side (would need blacklisting for that),
# it just removes it from the browser.
class LogoutView(APIView):
    permission_classes = []

    def post(self, request):
        response = Response(
            {"message": "Logged out successfully."},
            status=status.HTTP_200_OK
        )

        response.delete_cookie(settings.AUTH_COOKIE_ACCESS)
        response.delete_cookie(settings.AUTH_COOKIE_REFRESH)

        return response
    

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


class BanUserView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if user.role == 'admin':
            return Response({"error": "Cannot ban an admin."}, status=status.HTTP_403_FORBIDDEN)

        user.is_active = False
        user.save(update_fields=['is_active'])

        return Response(
            {"message": f"User '{user.username}' has been banned."},
            status=status.HTTP_200_OK
        )


class UnbanUserView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        user.is_active = True
        user.save(update_fields=['is_active'])

        return Response(
            {"message": f"User '{user.username}' has been unbanned."},
            status=status.HTTP_200_OK
        )


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        user = User.objects.filter(email=email).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = PasswordResetTokenGenerator().make_token(user)
            reset_link = f"https://yourfrontend.com/reset-password?uid={uid}&token={token}"

            send_mail(
                subject="Reset your password",
                message=f"Click here to reset your password: {reset_link}",
                from_email="noreply@yourapp.com",
                recipient_list=[email],
            )

        return Response(
            {"message": "If an account with that email exists, a reset link has been sent."},
            status=status.HTTP_200_OK
        )


class PasswordResetConfirmView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)