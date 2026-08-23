from django.db import models
from django.core.validators import MinValueValidator

from users.models import CustomerProfile
from products.models import Product


class Order(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("packaging", "Packaging"),
        ("rider_assigned", "Rider Assigned"),
        ("out_for_delivery", "Out for Delivery"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    ]

    PAYMENT_CHOICES = [
        ("cod", "Cash on Delivery"),
        ("esewa", "eSewa"),
    ]

    PAYMENT_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("failed", "Failed"),
    ]

    customer = models.ForeignKey(
        CustomerProfile,
        on_delete=models.CASCADE,
        related_name="orders",
    )
 # Rider fields
    assigned_rider = models.ForeignKey(
        "riders.RiderProfile",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_orders",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )
 # eSewa Fields
    payment_method = models.CharField(
        max_length=10,
        choices=PAYMENT_CHOICES,
        default="cod",
    )
    payment_status = models.CharField(
        max_length=10,
        choices=PAYMENT_STATUS_CHOICES,
        default="pending",
    )

    transaction_uuid = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
    )

    transaction_code = models.CharField(
        max_length=100,
        blank=True,
        default="",
    )

    # Snapshot delivery information at checkout.
    delivery_phone = models.CharField(
        max_length=15,
        blank=True,
        default="",
    )

    delivery_address = models.TextField(
        blank=True,
        default="",
    )

    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def recalculate_total(self):
        total = sum(
            item.subtotal()
            for item in self.items.all()
        )

        self.total_price = total

        self.save(
            update_fields=["total_price"]
        )

    def __str__(self):
        return (
            f"Order #{self.id} — "
            f"{self.customer.user.username} "
            f"({self.status})"
        )


class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        related_name="order_items",
    )

    # Snapshots of the product at purchase time.
    product_name = models.CharField(
        max_length=155,
    )

    price_at_purchase = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    quantity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        default=1,
    )

    class Meta:
        ordering = ["id"]

    def subtotal(self):
        return (
            self.price_at_purchase *
            self.quantity
        )

    def save(self, *args, **kwargs):

        if self.product and not self.product_name:
            self.product_name = self.product.name

        if self.product and not self.price_at_purchase:
            self.price_at_purchase = self.product.price

        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.quantity} × "
            f"{self.product_name} "
            f"(Order #{self.order_id})"
        )