from django.db import models


class WishlistItem(models.Model):
    customer = models.ForeignKey(
        "users.CustomerProfile",
        on_delete=models.CASCADE,
        related_name="wishlist_items",
    )
    product = models.ForeignKey(
        "products.Product",
        on_delete=models.CASCADE,
        related_name="wishlisted_by",
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("customer", "product")  # can't wishlist the same product twice
        ordering = ["-added_at"]

    def __str__(self):
        return f"{self.customer.user.username} ♥ {self.product.name}"