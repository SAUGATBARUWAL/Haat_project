from django.db import models
from django.conf import settings


class Product(models.Model):

    name = models.CharField(
        max_length=255
    )

    description = models.TextField()

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    stock = models.PositiveIntegerField(
        default=0
    )

    image = models.URLField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.name


class Cart(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return f"{self.user.username}'s Cart"


class CartItem(models.Model):

    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items'
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )

    quantity = models.PositiveIntegerField(
        default=1
    )

    def __str__(self):

        return f"{self.product.name} ({self.quantity})"


class Order(models.Model):

    STATUS_CHOICES = [

        ('Pending', 'Pending'),

        ('Processing', 'Processing'),

        ('Shipped', 'Shipped'),

        ('Delivered', 'Delivered'),

        ('Cancelled', 'Cancelled')

    ]

    user = models.ForeignKey(

        settings.AUTH_USER_MODEL,

        on_delete=models.CASCADE

    )

    total_price = models.DecimalField(

        max_digits=10,

        decimal_places=2,

        default=0

    )

    status = models.CharField(

        max_length=20,

        choices=STATUS_CHOICES,

        default='Pending'

    )

    created_at = models.DateTimeField(

        auto_now_add=True

    )

    def __str__(self):

        return f"Order #{self.id}"


class OrderItem(models.Model):

    order = models.ForeignKey(

        Order,

        on_delete=models.CASCADE,

        related_name='items'

    )

    product = models.ForeignKey(

        Product,

        on_delete=models.CASCADE

    )

    quantity = models.PositiveIntegerField(

        default=1

    )

    price = models.DecimalField(

        max_digits=10,

        decimal_places=2

    )

    def __str__(self):

        return f"{self.product.name} x {self.quantity}"