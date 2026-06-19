# serializers.py is used in rest framework it helps to convert the python objects into json / vice versa
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db import transaction
from .models import User, CustomerProfile, SellerProfile
from core.imagekit import upload_image


class CustomerRegisterSerializer(serializers.ModelSerializer):
    """
    Lightweight registration — only the bare minimum to create an account.
    Address, phone, and profile picture are collected later via
    CustomerDeliveryDetailsSerializer / CustomerProfilePictureSerializer.
    """
    password = serializers.CharField(
        min_length=8,
        write_only=True,
        required=True,
        style={"input_type": "password"}
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
        ]
        extra_kwargs = {
            "email": {"required": True},
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )
        return value

    def create(self, validated_data):
        with transaction.atomic():
            user = User.objects.create_user(
                username=validated_data["username"],
                email=validated_data["email"],
                password=validated_data["password"],
                role="customer",
            )
            # address/phone left blank, profile_picture falls back to model default
            CustomerProfile.objects.create(user=user)

        return user


class SellerRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        min_length=8,
        write_only=True,
        required=True,
        style={"input_type": "password"}
    )
    business_name = serializers.CharField(required=True)
    pan_number = serializers.CharField(required=True)
    business_address = serializers.CharField(required=True)
    profile_picture = serializers.ImageField(
        required=False,
        allow_null=True,
        write_only=True
    )
    business_document = serializers.FileField(
        required=True,
        allow_null=False
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "phone",
            "business_name",
            "pan_number",
            "business_address",
            "profile_picture",
            "business_document",
        ]
        extra_kwargs = {
            "email": {"required": True},
            "phone": {"required": True, "allow_blank": False},
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )
        return value

    def validate_pan_number(self, value):
        # Nepal PAN number must be exactly 9 digits
        if not value.isdigit() or len(value) != 9:
            raise serializers.ValidationError(
                "PAN number must be exactly 9 digits."
            )
        return value

    def create(self, validated_data):
        business_name = validated_data.pop("business_name")
        pan_number = validated_data.pop("pan_number")
        business_address = validated_data.pop("business_address")
        profile_picture = validated_data.pop("profile_picture", None)
        business_document = validated_data.pop("business_document")

        with transaction.atomic():
            user = User.objects.create_user(
                username=validated_data["username"],
                email=validated_data["email"],
                password=validated_data["password"],
                phone=validated_data.get("phone"),
                role="seller",
            )

            seller_profile_kwargs = {
                "user": user,
                "business_name": business_name,
                "pan_number": pan_number,
                "business_address": business_address,
            }

            if profile_picture:
                profile_picture_url = upload_image(
                    profile_picture,
                    profile_picture.name,
                    folder=f"/users/profile-pictures/{user.id}"
                )
                if not profile_picture_url:
                    raise serializers.ValidationError(
                        {"profile_picture": "Failed to upload image. Please try again."}
                    )
                seller_profile_kwargs["profile_picture"] = profile_picture_url

            business_document_url = upload_image(
                business_document,
                business_document.name,
                folder=f"/users/business-documents/{user.id}"
            )
            if not business_document_url:
                raise serializers.ValidationError(
                    {"business_document": "Failed to upload business document. Please try again."}
                )
            seller_profile_kwargs["business_document"] = business_document_url

            SellerProfile.objects.create(**seller_profile_kwargs)

        return user


class CustomerDeliveryDetailsSerializer(serializers.ModelSerializer):
    """
    Used at checkout time — collects phone + address needed for delivery.
    Both required since an order can't be delivered without them.
    """
    phone = serializers.CharField(
        source="user.phone",
        required=True,
        allow_blank=False,
        max_length=15,
    )
    address = serializers.CharField(
        required=True,
        allow_blank=False,
    )

    class Meta:
        model = CustomerProfile
        fields = ["phone", "address"]

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})

        with transaction.atomic():
            if "phone" in user_data:
                instance.user.phone = user_data["phone"]
                instance.user.save(update_fields=["phone"])

            instance.address = validated_data.get("address", instance.address)
            instance.save(update_fields=["address"])

        return instance


class CustomerProfilePictureSerializer(serializers.ModelSerializer):
    """
    Used anytime from settings — lets the customer change their
    profile picture independently of delivery details.
    """
    profile_picture = serializers.ImageField(
        required=True,
        allow_null=False,
        write_only=True,
    )

    class Meta:
        model = CustomerProfile
        fields = ["profile_picture"]

    def update(self, instance, validated_data):
        picture = validated_data.pop("profile_picture")

        picture_url = upload_image(
            picture,
            picture.name,
            folder=f"/users/profile-pictures/{instance.user.id}"
        )
        if not picture_url:
            raise serializers.ValidationError(
                {"profile_picture": "Failed to upload image. Please try again."}
            )

        instance.profile_picture = picture_url
        instance.save(update_fields=["profile_picture"])

        return instance


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Extends the default JWT serializer to embed role/username
    in the token claims and the login response.
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['username'] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['username'] = self.user.username

        if self.user.role == 'seller':
            seller_profile = getattr(self.user, 'seller_profile', None)
            if seller_profile:
                data['verification_status'] = seller_profile.verification_status

        return data


class UserProfileSerializer(serializers.ModelSerializer):
    """Used to display the logged-in user's own profile."""

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'role', 'created_at']


class SellerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerProfile
        fields = [
            'business_name',
            'pan_number',
            'business_address',
            'profile_picture',
            'business_document',
            'verification_status',
            'created_at',
        ]


class CustomerProfileSerializer(serializers.ModelSerializer):
    """Read-only display of the customer's full profile, including phone."""
    phone = serializers.CharField(source="user.phone", read_only=True)

    class Meta:
        model = CustomerProfile
        fields = ['phone', 'address', 'profile_picture']