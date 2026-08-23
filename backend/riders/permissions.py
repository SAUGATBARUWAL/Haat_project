from rest_framework.permissions import BasePermission


class IsRider(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "rider"
            and request.user.is_active
        )