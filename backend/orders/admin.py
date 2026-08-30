from django import forms
from django.contrib import admin
from django.db import transaction

from .models import Order, OrderItem
from riders.models import RiderProfile


# ============================================================================
# ORDER ADMIN FORM
# ============================================================================

class OrderAdminForm(forms.ModelForm):

    class Meta:
        model = Order
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # ------------------------------------------------------------
        # Show only available riders in the dropdown.
        # ------------------------------------------------------------

        available_riders = RiderProfile.objects.filter(
            availability_status="available"
        )

        # ------------------------------------------------------------
        # If this order already has a rider, keep that rider
        # visible even if they are currently busy.
        # ------------------------------------------------------------

        if self.instance and self.instance.pk:

            current_rider = self.instance.assigned_rider

            if current_rider:

                available_riders = (
                    RiderProfile.objects.filter(
                        availability_status="available"
                    )
                    | RiderProfile.objects.filter(
                        pk=current_rider.pk
                    )
                )

        self.fields["assigned_rider"].queryset = (
            available_riders.distinct()
        )


# ============================================================================
# ORDER ITEM INLINE
# ============================================================================

class OrderItemInline(admin.TabularInline):

    model = OrderItem

    extra = 0

    readonly_fields = [
        "product",
        "product_name",
        "price_at_purchase",
        "quantity",
    ]


# ============================================================================
# ORDER ADMIN
# ============================================================================

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    form = OrderAdminForm

    list_display = [
        "id",
        "customer",
        "assigned_rider",
        "status",
        "payment_method",
        "total_price",
        "created_at",
    ]

    list_filter = [
        "status",
        "payment_method",
        "assigned_rider",
        "created_at",
    ]

    search_fields = [
        "customer__user__username",
        "customer__user__email",
        "delivery_phone",
        "delivery_address",
        "assigned_rider__full_name",
        "assigned_rider__user__username",
    ]

    list_select_related = [
        "customer",
        "customer__user",
        "assigned_rider",
        "assigned_rider__user",
    ]

    readonly_fields = [
        "total_price",
        "created_at",
        "updated_at",
    ]

    inlines = [
        OrderItemInline,
    ]

    # ========================================================================
    # SAVE ORDER
    # ========================================================================

    @transaction.atomic
    def save_model(self, request, obj, form, change):
        """
        Handle rider assignment through Django Admin.

        When an admin assigns a rider:

            assigned_rider = rider
            status = rider_assigned
            rider availability = busy

        When an admin removes a rider:

            assigned_rider = None
            previous rider = available

        When a different rider is assigned:

            previous rider = available
            new rider = busy
        """

        previous_rider = None

        # ------------------------------------------------------------
        # Get the rider that was previously assigned.
        # ------------------------------------------------------------

        if change and obj.pk:

            try:
                old_order = (
                    Order.objects
                    .select_related("assigned_rider")
                    .get(pk=obj.pk)
                )

                previous_rider = old_order.assigned_rider

            except Order.DoesNotExist:
                previous_rider = None

        new_rider = obj.assigned_rider

        # ============================================================
        # RIDER WAS ASSIGNED
        # ============================================================

        if new_rider:

            # --------------------------------------------------------
            # If this is a new rider or a different rider,
            # mark the new rider busy.
            # --------------------------------------------------------

            if previous_rider != new_rider:

                # Safety check.
                # Do not allow assignment to another busy rider.
                if (
                    new_rider.availability_status == "busy"
                    and previous_rider != new_rider
                ):
                    raise forms.ValidationError(
                        "This rider is currently busy."
                    )

                # ----------------------------------------------------
                # If another rider was previously assigned,
                # make that rider available.
                # ----------------------------------------------------

                if (
                    previous_rider
                    and previous_rider != new_rider
                ):

                    previous_rider.availability_status = "available"

                    previous_rider.save(
                        update_fields=[
                            "availability_status"
                        ]
                    )

                # ----------------------------------------------------
                # Assign new rider.
                # ----------------------------------------------------

                new_rider.availability_status = "busy"

                new_rider.save(
                    update_fields=[
                        "availability_status"
                    ]
                )

                # ----------------------------------------------------
                # Move order into rider_assigned state.
                # ----------------------------------------------------

                if obj.status not in [
                    "delivered",
                    "cancelled",
                ]:

                    obj.status = "rider_assigned"

        # ============================================================
        # RIDER WAS REMOVED
        # ============================================================

        else:

            # --------------------------------------------------------
            # If there was a previous rider, make them available.
            # --------------------------------------------------------

            if previous_rider:

                previous_rider.availability_status = "available"

                previous_rider.save(
                    update_fields=[
                        "availability_status"
                    ]
                )

                # ----------------------------------------------------
                # If order was waiting for this rider, move it back
                # to packaging.
                # ----------------------------------------------------

                if obj.status == "rider_assigned":

                    obj.status = "packaging"

        # ============================================================
        # SAVE ORDER
        # ============================================================

        super().save_model(
            request,
            obj,
            form,
            change,
        )


# ============================================================================
# ORDER ITEM ADMIN
# ============================================================================

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):

    list_display = [
        "order",
        "product_name",
        "price_at_purchase",
        "quantity",
        "subtotal",
    ]

    search_fields = [
        "product_name",
        "order__id",
    ]

    readonly_fields = [
        "order",
        "product",
        "product_name",
        "price_at_purchase",
        "quantity",
    ]