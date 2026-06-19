from rest_framework.permissions import BasePermission, SAFE_METHODS


# 👤 1. Only authenticated users
class IsAuthenticatedUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


# 🧑‍💼 2. Only Customers
class IsCustomer(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == "customer"
        )


# 🛍️ 3. Only Sellers
class IsSeller(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == "seller"
        )


# 👑 4. Only Admins (superuser OR role-based admin)
class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            (
                request.user.role == "admin" or
                request.user.is_superuser
            )
        )


# ✅ 5. Only ACTIVE users (optional safety layer)
class IsActiveUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.is_active
        )


# 🔐 6. Verified Seller ONLY (VERY important for marketplace)
class IsVerifiedSeller(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == "seller" and
            hasattr(request.user, "seller_profile") and
            request.user.seller_profile.verification_status == "verified"
        )


# 🧍 7. User can access only their own data (profile, settings, etc.)
class IsOwner(BasePermission):
    """
    Works for objects that have a `user` field.
    Example: CustomerProfile, SellerProfile
    """

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


# ✏️ 8. Owner OR ReadOnly (very useful for profiles/products later)
class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        # Allow safe methods (GET, HEAD, OPTIONS)
        if request.method in SAFE_METHODS:
            return True

        # Write actions only for owner
        return obj.user == request.user