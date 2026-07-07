from django.db import models
from django.core.validators import MinValueValidator
from users.models import CustomerProfile
from products.models import Product


class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    ]

    customer = models.ForeignKey(
        CustomerProfile, on_delete=models.CASCADE, related_name="orders"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def recalculate_total(self):
        total = sum(item.subtotal() for item in self.items.all())
        self.total_price = total
        self.save(update_fields=["total_price"])

    def __str__(self):
        return f"Order #{self.id} — {self.customer.user.username} ({self.status})"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        Product, on_delete=models.SET_NULL, null=True, related_name="order_items"
    )# set_null is used here to allow the product to be deleted without deleting the order item, preserving the order history

    # snapshot fields — capture product name/price at time of purchase,
    # so later price changes or product deletion don't rewrite history
    product_name = models.CharField(max_length=155)
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)], default=1)

    class Meta:
        ordering = ["id"]

    def subtotal(self):
        return self.price_at_purchase * self.quantity

    def save(self, *args, **kwargs):
        # auto-fill snapshot fields from the live product if not already set
        if self.product and not self.product_name:
            self.product_name = self.product.name
        if self.product and not self.price_at_purchase:
            self.price_at_purchase = self.product.price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity} × {self.product_name} (Order #{self.order_id})"