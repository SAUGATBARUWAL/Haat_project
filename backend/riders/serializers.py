from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from .models import RiderProfile


User = get_user_model()


class RiderProfileSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    first_name = serializers.CharField(
        source="user.first_name",
        read_only=True,
    )

    last_name = serializers.CharField(
        source="user.last_name",
        read_only=True,
    )

    phone = serializers.CharField(
        source="user.phone",
        read_only=True,
    )

    class Meta:
        model = RiderProfile

        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "phone",
            "availability_status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = fields


class RiderCreateSerializer(serializers.ModelSerializer):

    """
    Admin-only: creates a User (role="rider") and its RiderProfile
    from just a name and phone number.

    - username is generated automatically from the phone number
      (User requires one; riders don't need to know/use it).
    - no password is collected here, so the account is created with
      an unusable password (Django's create_user default when
      password=None). Wire up a separate "set password" / invite
      flow later if riders need to log in themselves.
    - `name` is split into first_name/last_name on the first space,
      since User (via AbstractUser) stores them separately.
    """

    name = serializers.CharField(write_only=True)
    phone = serializers.CharField(write_only=True)

    class Meta:
        model = RiderProfile

        fields = [
            "id",
            "name",
            "phone",
            "availability_status",
        ]

        read_only_fields = ["id"]
        extra_kwargs = {
            "availability_status": {"required": False},
        }

    def validate_phone(self, value):

        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError(
                "A user with this phone number already exists."
            )

        return value

    @staticmethod
    def _generate_username(phone):

        digits = "".join(ch for ch in phone if ch.isdigit())
        base = f"rider_{digits}" if digits else "rider"

        username = base
        suffix = 1

        while User.objects.filter(username=username).exists():
            suffix += 1
            username = f"{base}_{suffix}"

        return username

    @transaction.atomic
    def create(self, validated_data):

        full_name = validated_data["name"].strip()
        phone = validated_data["phone"]

        first_name, _, last_name = full_name.partition(" ")

        user = User.objects.create_user(
            username=self._generate_username(phone),
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            role="rider",
            # password intentionally omitted -> unusable password
        )

        rider = RiderProfile.objects.create(
            user=user,
            availability_status=validated_data.get(
                "availability_status", "available"
            ),
        )

        return rider

    def to_representation(self, instance):
        # Re-use the read serializer so POST responses look identical
        # to GET responses from the list/detail views.
        return RiderProfileSerializer(instance).data

class RiderAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = RiderProfile
        fields = ["availability_status"]

    def validate_availability_status(self, value):
        if value not in ["available", "offline"]:
            raise serializers.ValidationError(
                "Riders can only manually change their status to available or offline."
            )

        return value


class OrderRiderSerializer(serializers.Serializer):

    id = serializers.IntegerField()
    username = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    phone = serializers.CharField()

    @staticmethod
    def from_rider(rider):

        return {
            "id": rider.id,
            "username": rider.user.username,
            "first_name": rider.user.first_name,
            "last_name": rider.user.last_name,
            "phone": rider.user.phone or "",
        }