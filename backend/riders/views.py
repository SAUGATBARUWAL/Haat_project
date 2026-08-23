from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateAPIView,
)
from rest_framework.permissions import IsAuthenticated

from users.permissions import IsAdmin

from .models import RiderProfile
from .serializers import (
    RiderSerializer,
    RiderCreateSerializer,
)


class AdminRiderListCreateView(ListCreateAPIView):
    """
    GET  - Admin can view all riders.
    POST - Admin can create a new rider.
    """

    permission_classes = [
        IsAuthenticated,
        IsAdmin,
    ]

    def get_queryset(self):
        return RiderProfile.objects.select_related("user").all()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return RiderCreateSerializer

        return RiderSerializer


class AdminRiderDetailView(RetrieveUpdateAPIView):
    """
    GET   - Admin can view a specific rider.
    PATCH - Admin can update rider information/status.
    """

    permission_classes = [
        IsAuthenticated,
        IsAdmin,
    ]

    serializer_class = RiderSerializer

    def get_queryset(self):
        return RiderProfile.objects.select_related("user").all()