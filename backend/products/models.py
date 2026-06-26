from django.db import models
from django.utils.text import slugify
from users.models import SellerProfile


# Create your models here.
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    
class Product(models.Model):
    seller=models.ForeignKey(
        SellerProfile,on_delete=models.CASCADE,related_name="products"
    )

    categories= models.ManyToManyField(
        Category, related_name="products", blank=True
    )

    name= models.CharField(max_length=155)
    description=models.TextField(blank=True, null=True)
    price =models.DecimalField(max_digits=10 , decimal_places=2)
    stock =models.PositiveBigIntegerField(default=0)
    image =models.URLField(blank=True, null=True)

    is_active=models.BooleanField(default=True) # lets seller "delist" items without deleting

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering=["-created_at"]

    def __str__(self):
        return f"{self.name}-{self.seller.business_name}"


