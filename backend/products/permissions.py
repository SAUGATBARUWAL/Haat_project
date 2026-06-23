from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsSellerOwnerOrReadOnly(BasePermission):
    """
    Anyone (including unauthenticated users) can view products.
    Only the seller who owns a product can edit or delete it.
    Only authenticated sellers can create new products.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'seller'

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.seller.user == request.user