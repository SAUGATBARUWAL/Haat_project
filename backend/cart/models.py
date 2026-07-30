from django.db import models
from django.core.validators import MinValueValidator


class Cart(models.Model):
    """One cart per customer, created lazily on first add-to-cart."""
    customer = models.OneToOneField(
        "users.CustomerProfile",
        on_delete=models.CASCADE,
        related_name="cart",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart — {self.customer.user.username}"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE, related_name="cart_items")
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Adding the same product twice increments quantity instead of
        # creating a duplicate row — enforced at the view level in
        # perform_create, this just guarantees it at the DB level too.
        unique_together = ("cart", "product")
        ordering = ["-added_at"]

    def __str__(self):
        return f"{self.quantity} × {self.product.name}"