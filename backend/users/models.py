from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class User(AbstractUser):
    ROLE_CHOICES= (
        ('customer', 'Customer'),
        ('seller', 'Seller'),
        ('admin', 'Admin'),
    )
    # Adding additional custom fields in the database 
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    phone = models.CharField(max_length=15, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = "admin"
        super().save(*args, **kwargs)


class SellerProfile(models.Model):
        
    VERIFICATION_STATUS = (
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    )
    #Each customer profile belongs to exactly one user, and each user can have at most one customer profile.
    user = models.OneToOneField(User, on_delete=models.CASCADE ,related_name="seller_profile")# One-to-One relationship
  

    business_name = models.CharField(max_length=100)
    pan_number = models.CharField(max_length=20)
    business_address = models.TextField(max_length=255)
    profile_picture = models.URLField(
    blank=True,
    null=True,
    default="https://ik.imagekit.io/fndgsrylj/Users/simple-user-default-icon-free-png.webp?updatedAt=1781789475953"
    )
  
    # Official document for business verification (PAN card, registration cert, etc.)
    business_document = models.URLField()
 
    verification_status = models.CharField( max_length=10, choices=VERIFICATION_STATUS, default='pending')


    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}-{self.business_name}"
    

class CustomerProfile(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE,related_name="customer_profile")
    address= models.TextField(blank=True , null=True)
    profile_picture = models.URLField(
    blank=True,
    null=True,
    default="https://ik.imagekit.io/fndgsrylj/Users/simple-user-default-icon-free-png.webp?updatedAt=1781789475953"
    )
    def __str__(self):
        return f"{self.user.username}"