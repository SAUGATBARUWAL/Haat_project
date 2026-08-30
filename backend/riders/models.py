from django.conf import settings
from django.db import models


class RiderProfile(models.Model):

    AVAILABILITY_CHOICES = [
        ("available", "Available"),
        ("busy", "Busy"),
        ("offline", "Offline"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="rider_profile",
    )

    # Captured from the physical application form.
    # Kept separate from `user.username` since the
    # username is just a login handle, not the rider's
    # actual name.
    full_name = models.CharField(max_length=150, null=True, blank=True)

    availability_status = models.CharField(
        max_length=10,
        choices=AVAILABILITY_CHOICES,
        default="available",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} ({self.user.username})"