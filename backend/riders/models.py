from django.db import models
from django.conf import settings


class RiderProfile(models.Model):

    VEHICLE_CHOICES = (
        ("bike", "Bike"),
        ("scooter", "Scooter"),
        ("car", "Car"),
        ("van", "Van"),
    )

    STATUS_CHOICES = (
        ("available", "Available"),
        ("busy", "Busy"),
        ("offline", "Offline"),
    )

    VERIFICATION_CHOICES = (
        ("pending", "Pending"),
        ("verified", "Verified"),
        ("rejected", "Rejected"),
    )

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="rider_profile",
    )

    vehicle_type = models.CharField(
        max_length=20,
        choices=VEHICLE_CHOICES,
    )

    vehicle_number = models.CharField(
        max_length=30,
        unique=True,
    )

    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_CHOICES,
        default="verified",
    )

    availability_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="offline",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.vehicle_number}"