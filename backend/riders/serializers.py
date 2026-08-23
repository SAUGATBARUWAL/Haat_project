from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from .models import RiderProfile


User = get_user_model()


class RiderSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)

    class Meta:
        model = RiderProfile
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "vehicle_type",
            "vehicle_number",
            "verification_status",
            "availability_status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "username",
            "email",
            "phone",
            "created_at",
            "updated_at",
        ]


class RiderCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=15)
    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    vehicle_type = serializers.ChoiceField(
        choices=RiderProfile.VEHICLE_CHOICES
    )

    vehicle_number = serializers.CharField(max_length=30)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "A user with this username already exists."
            )
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )
        return value

    def validate_vehicle_number(self, value):
        if RiderProfile.objects.filter(
            vehicle_number=value
        ).exists():
            raise serializers.ValidationError(
                "This vehicle number is already registered."
            )
        return value

    @transaction.atomic
    def create(self, validated_data):

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            phone=validated_data["phone"],
            role="rider",
        )

        rider = RiderProfile.objects.create(
            user=user,
            vehicle_type=validated_data["vehicle_type"],
            vehicle_number=validated_data["vehicle_number"],
            verification_status="verified",
            availability_status="offline",
        )

        return rider