from decimal import Decimal

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
    )

    slug = models.SlugField(
        max_length=120,
        unique=True,
        blank=True,
    )

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

    name = models.CharField(
        max_length=255,
    )

    description = models.TextField(
        blank=True,
        default="",
    )

    # Original price of the product.
    # This price is NOT changed when a discount is applied.
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.01")),
        ],
    )

    # Discount given by the seller.
    #
    # Example:
    # 0.00  = no discount
    # 10.00 = 10% discount
    # 50.00 = 50% discount
    # 100.00 = completely free
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[
            MinValueValidator(Decimal("0.00")),
            MaxValueValidator(Decimal("100.00")),
        ],
    )

    stock = models.PositiveIntegerField(
        default=0,
    )

    categories = models.ManyToManyField(
        Category,
        related_name="products",
        blank=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

    @property
    def discounted_price(self):
        """
        Calculate the final selling price after applying
        the seller's discount.

        Examples:

        price = 1000
        discount = 20
        result = 800

        price = 1000
        discount = 0
        result = 1000

        price = 1000
        discount = 100
        result = 0
        """

        discount_amount = (
            self.price
            * self.discount_percentage
            / Decimal("100")
        )

        return (self.price - discount_amount).quantize(
            Decimal("0.01")
        )

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    """
    Gallery images belonging to a product.

    The primary image is used by the frontend
    as the product's cover/card image.
    """

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images",
    )

    # This stores the ImageKit URL.
    # Existing ImageKit images are NOT affected by
    # the discount changes.
    image = models.URLField()

    label = models.CharField(
        max_length=50,
        blank=True,
        default="",
    )

    is_primary = models.BooleanField(
        default=False,
    )

    order = models.PositiveIntegerField(
        default=0,
    )

    class Meta:
        ordering = ["order", "id"]

    def save(self, *args, **kwargs):
        """
        Make sure only one image per product
        can be marked as primary.
        """

        if self.is_primary:
            ProductImage.objects.filter(
                product=self.product,
                is_primary=True,
            ).exclude(
                pk=self.pk
            ).update(
                is_primary=False
            )

        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.product.name} — "
            f"{self.label or f'image #{self.order}'}"
        )


class ProductSize(models.Model):
    """
    Simple size labels for a product.

    Examples:
    S, M, L, XL
    38, 40, 42
    """

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="sizes",
    )

    label = models.CharField(
        max_length=20,
    )

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.product.name} — {self.label}"