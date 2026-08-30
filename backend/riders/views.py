from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateAPIView,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from users.permissions import IsAdmin
from .permissions import IsRider

from .models import RiderProfile
from .serializers import (
    RiderProfileSerializer,
    RiderCreateSerializer,
    RiderAvailabilitySerializer,
)


# ============================================================================
# ADMIN RIDER LIST / CREATE
# ============================================================================

class AdminRiderListCreateView(ListCreateAPIView):
    """
    GET
        Admin can view all riders.

    POST
        Admin can create a new rider.
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

        return RiderProfileSerializer


# ============================================================================
# ADMIN RIDER DETAIL
# ============================================================================

class AdminRiderDetailView(RetrieveUpdateAPIView):
    """
    GET
        Admin can view a specific rider.

    PATCH
        Admin can update rider information/status.
    """

    permission_classes = [
        IsAuthenticated,
        IsAdmin,
    ]

    serializer_class = RiderProfileSerializer

    def get_queryset(self):
        return RiderProfile.objects.select_related("user").all()


# ============================================================================
# RIDER AVAILABILITY STATUS
# ============================================================================

class RiderStatusView(APIView):
    """
    GET
        Return the availability status of the logged-in rider.

    PATCH
        Allow the logged-in rider to change their status between:

            available
            offline

        Riders cannot manually set themselves to busy.

        The busy status should be controlled by the order system when
        a rider is assigned to an active order.
    """

    permission_classes = [
        IsAuthenticated,
        IsRider,
    ]

    # ------------------------------------------------------------------------
    # GET /riders/status/
    # ------------------------------------------------------------------------

    def get(self, request):
        rider = request.user.rider_profile

        return Response({
            "availability_status": rider.availability_status
        })

    # ------------------------------------------------------------------------
    # PATCH /riders/status/
    # ------------------------------------------------------------------------

    def patch(self, request):
        rider = request.user.rider_profile

        serializer = RiderAvailabilitySerializer(
            rider,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)

        serializer.save()

        return Response({
            "availability_status": rider.availability_status
        })