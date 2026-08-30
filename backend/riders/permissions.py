from rest_framework.permissions import BasePermission


class IsRider(BasePermission):

    """
    A RiderProfile only ever exists after in-person
    verification at the office (created via Django admin),
    so there's no "pending" state to check here. The only
    thing that matters is whether the account is still active
    — admin toggles user.is_active off if a rider leaves.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_active
            and getattr(request.user, "role", None) == "rider"
            and hasattr(request.user, "rider_profile")
        )