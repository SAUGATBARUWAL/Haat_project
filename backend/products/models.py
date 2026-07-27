from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    seller = models.ForeignKey(
        "users.SellerProfile",
        on_delete=models.CASCADE,
        related_name="products",
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    categories = models.ManyToManyField(Category, related_name="products", blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    """Gallery images for a product. First/primary one is what shows on the card."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.URLField()
    label = models.CharField(max_length=50, blank=True, default="")  # e.g. "Red", "Green", "Front view"
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.product.name} — {self.label or f'image #{self.order}'}"


class ProductSize(models.Model):
    """Simple size labels shown as options on the product detail view (no separate stock)."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="sizes")
    label = models.CharField(max_length=20)  # e.g. "S", "M", "L", "42"

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.product.name} — {self.label}"