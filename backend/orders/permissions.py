from rest_framework.permissions import BasePermission


class IsOrderOwner(BasePermission):
    """Only the customer who placed the order can view/access it."""

    def has_object_permission(self, request, view, obj):
        return obj.customer.user == request.user