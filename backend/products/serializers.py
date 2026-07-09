from rest_framework import serializers
from .models import Product, Category
from core.imagekit import upload_image


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']
        read_only_fields = ['id', 'slug']


class ProductSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True, write_only=True)
    image_url = serializers.URLField(source='image', read_only=True)
    categories = serializers.SlugRelatedField(
        slug_field='slug',
        queryset=Category.objects.all(),
        many=True,
        required=False,
    )

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'description',
            'price',
            'stock',
            'image',
            'image_url',
            'categories',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value

    def create(self, validated_data):
        image_file = validated_data.pop('image', None)
        categories = validated_data.pop('categories', [])
        seller_profile = self.context['request'].user.seller_profile

        product = Product.objects.create(seller=seller_profile, **validated_data)

        if categories:
            product.categories.set(categories)

        if image_file:
            image_url = upload_image(
                image_file,
                image_file.name,
                folder=f"/products/{product.id}"
            )
            if image_url:
                product.image = image_url
                product.save(update_fields=['image'])

        return product

    def update(self, instance, validated_data):
        image_file = validated_data.pop('image', None)
        categories = validated_data.pop('categories', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if categories is not None:
            instance.categories.set(categories)

        if image_file:
            image_url = upload_image(
                image_file,
                image_file.name,
                folder=f"/products/{instance.id}"
            )
            if image_url:
                instance.image = image_url

        instance.save()
        return instance


class ProductPriceUpdateSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for quick price-only updates,
    so sellers don't need to resend the entire product payload
    just to change a price.
    """
    class Meta:
        model = Product
        fields = ['price']

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value