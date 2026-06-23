from django.db import models
from users.models import SellerProfile

# Create your models here.
class Product(models.Model):
    seller=models.ForeignKey(
        SellerProfile,on_delete=models.CASCADE,related_name="products"
    )
    name= models.CharField(max_length=155)
    description=models.TextField(blank=True, null=True)
    price =models.DecimalField(max_digits=10 , decimal_places=2)
    stock =models.PositiveBigIntegerField(default=0)
    image =models.URLField(blank=True, null=True)

    is_active=models.BooleanField(default=True) # lets seller "delist" items without deleting

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name}-{self.seller.business_name}"


