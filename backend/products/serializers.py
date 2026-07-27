from rest_framework import serializers
from .models import Product, Category, ProductImage, ProductSize
from core.imagekit import upload_image
from users.models import SellerProfile



class ProductSellerSerializer(serializers.ModelSerializer):
    """
    Public-safe seller info attached to each product — just enough to
    show a storefront name and link to it. Deliberately excludes
    pan_number, business_document, verification_status, etc.
    """
    class Meta:
        model = SellerProfile
        fields = ['id', 'business_name', 'profile_picture']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']
        read_only_fields = ['id', 'slug']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'label', 'is_primary', 'order']
        read_only_fields = ['id']


class ProductSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSize
        fields = ['id', 'label']
        read_only_fields = ['id']


class ProductSerializer(serializers.ModelSerializer):
    # Read-only nested output
    images = ProductImageSerializer(many=True, read_only=True)
    sizes = ProductSizeSerializer(many=True, read_only=True)
    seller = ProductSellerSerializer(read_only=True) 

    # Write-only inputs from the form
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )
    image_labels = serializers.ListField(
        child=serializers.CharField(max_length=50, allow_blank=True),
        write_only=True, required=False,
    )
    size_labels = serializers.ListField(
        child=serializers.CharField(max_length=20), write_only=True, required=False
    )
    categories = serializers.SlugRelatedField(
        slug_field='slug', queryset=Category.objects.all(), many=True, required=False,
    )

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'stock',
            'categories', 'images', 'uploaded_images', 'image_labels',
            'sizes', 'size_labels', 'is_active','seller', 'is_active', 
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value

    def validate_uploaded_images(self, value):
        if len(value) > 8:
            raise serializers.ValidationError("You can upload up to 8 images per product.")
        return value

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        image_labels = validated_data.pop('image_labels', [])
        size_labels = validated_data.pop('size_labels', [])
        categories = validated_data.pop('categories', [])
        seller_profile = self.context['request'].user.seller_profile

        product = Product.objects.create(seller=seller_profile, **validated_data)

        if categories:
            product.categories.set(categories)

        for label in size_labels:
            ProductSize.objects.create(product=product, label=label)

        for index, image_file in enumerate(uploaded_images):
            image_url = upload_image(
                image_file, image_file.name, folder=f"/products/{product.id}"
            )
            if image_url:
                label = image_labels[index] if index < len(image_labels) else ""
                ProductImage.objects.create(
                    product=product,
                    image=image_url,
                    label=label,
                    is_primary=(index == 0),
                    order=index,
                )

        return product

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        image_labels = validated_data.pop('image_labels', [])
        size_labels = validated_data.pop('size_labels', None)
        categories = validated_data.pop('categories', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if categories is not None:
            instance.categories.set(categories)

        if size_labels is not None:
            instance.sizes.all().delete()
            for label in size_labels:
                ProductSize.objects.create(product=instance, label=label)

        if uploaded_images:
            start_order = instance.images.count()
            for index, image_file in enumerate(uploaded_images):
                image_url = upload_image(
                    image_file, image_file.name, folder=f"/products/{instance.id}"
                )
                if image_url:
                    label = image_labels[index] if index < len(image_labels) else ""
                    ProductImage.objects.create(
                        product=instance,
                        image=image_url,
                        label=label,
                        is_primary=(start_order == 0 and index == 0),
                        order=start_order + index,
                    )

        return instance


class ProductPriceUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['price']

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value