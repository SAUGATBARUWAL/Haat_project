from django.db import transaction
from django.db.models import Avg
from rest_framework import serializers

from .models import (
    Product,
    Category,
    ProductImage,
    ProductSize,
)

from core.imagekit import upload_image
from users.models import SellerProfile


class ProductSellerSerializer(serializers.ModelSerializer):
    """
    Public seller information shown with a product.
    Sensitive seller information is intentionally excluded.
    """

    class Meta:
        model = SellerProfile

        fields = [
            "id",
            "business_name",
            "profile_picture",
        ]


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category

        fields = [
            "id",
            "name",
            "slug",
        ]

        read_only_fields = [
            "id",
            "slug",
        ]


class ProductImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductImage

        fields = [
            "id",
            "image",
            "label",
            "is_primary",
            "order",
        ]

        read_only_fields = [
            "id",
        ]


class ProductSizeSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductSize

        fields = [
            "id",
            "label",
        ]

        read_only_fields = [
            "id",
        ]


class ProductSerializer(serializers.ModelSerializer):

    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    # Read-only nested output
    images = ProductImageSerializer(
        many=True,
        read_only=True,
    )

    sizes = ProductSizeSerializer(
        many=True,
        read_only=True,
    )

    seller = ProductSellerSerializer(
        read_only=True,
    )

    # Write-only image uploads
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
        allow_empty=True,
    )

    # Labels corresponding to uploaded_images
    image_labels = serializers.ListField(
        child=serializers.CharField(
            max_length=50,
            allow_blank=True,
        ),
        write_only=True,
        required=False,
        allow_empty=True,
    )

    # Sizes sent from frontend
    size_labels = serializers.ListField(
        child=serializers.CharField(
            max_length=20,
            allow_blank=False,
        ),
        write_only=True,
        required=False,
        allow_empty=True,
    )

    # Categories are written using their slug
    categories = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=Category.objects.all(),
        many=True,
        required=False,
    )

    class Meta:
        model = Product

        fields = [
            "id",
            "name",
            "description",
            "price",
            "discount_percentage",
            "discounted_price",
            "stock",
            "categories",
            "images",
            "uploaded_images",
            "image_labels",
            "sizes",
            "size_labels",
            "is_active",
            "seller",
            "created_at",
            "updated_at",
            "average_rating",
            "review_count",
        ]

        read_only_fields = [
            "id",
            "discounted_price",
            "images",
            "sizes",
            "seller",
            "created_at",
            "updated_at",
            "average_rating",
            "review_count",
        ]

    # ---------------------------------------------------------
    # Ratings
    # ---------------------------------------------------------

    def get_average_rating(self, obj):

        result = obj.reviews.aggregate(
            average=Avg("rating")
        )

        average = result["average"]

        if average is None:
            return 0

        return round(average, 1)

    def get_review_count(self, obj):
        return obj.reviews.count()

    # ---------------------------------------------------------
    # Validation
    # ---------------------------------------------------------

    def validate_price(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "Price must be greater than zero."
            )

        return value

    def validate_discount_percentage(self, value):

        if value < 0 or value > 100:
            raise serializers.ValidationError(
                "Discount percentage must be between 0 and 100."
            )

        return value

    def validate_uploaded_images(self, value):

        if len(value) > 8:
            raise serializers.ValidationError(
                "You can upload up to 8 images per product."
            )

        return value

    def validate_image_labels(self, value):

        if len(value) > 8:
            raise serializers.ValidationError(
                "You can provide labels for up to 8 images."
            )

        return value

    def validate_size_labels(self, value):

        cleaned = []

        for label in value:

            label = label.strip()

            if not label:
                raise serializers.ValidationError(
                    "Size labels cannot be empty."
                )

            if label not in cleaned:
                cleaned.append(label)

        return cleaned

    def validate(self, attrs):

        uploaded_images = attrs.get(
            "uploaded_images",
            [],
        )

        image_labels = attrs.get(
            "image_labels",
            [],
        )

        if len(image_labels) > len(uploaded_images):
            raise serializers.ValidationError({
                "image_labels": (
                    "You cannot provide more image labels "
                    "than uploaded images."
                )
            })

        return attrs

    # ---------------------------------------------------------
    # Create
    # ---------------------------------------------------------

    def create(self, validated_data):

        uploaded_images = validated_data.pop(
            "uploaded_images",
            [],
        )

        image_labels = validated_data.pop(
            "image_labels",
            [],
        )

        size_labels = validated_data.pop(
            "size_labels",
            [],
        )

        categories = validated_data.pop(
            "categories",
            [],
        )

        request = self.context.get("request")

        if not request:
            raise serializers.ValidationError(
                "Request context is missing."
            )

        if not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        try:
            seller_profile = request.user.seller_profile

        except SellerProfile.DoesNotExist:
            raise serializers.ValidationError(
                "You do not have a seller profile."
            )

        with transaction.atomic():

            product = Product.objects.create(
                seller=seller_profile,
                **validated_data,
            )

            # Categories
            if categories:
                product.categories.set(categories)

            # Sizes
            for label in size_labels:

                ProductSize.objects.create(
                    product=product,
                    label=label,
                )

            # Images
            for index, image_file in enumerate(
                uploaded_images
            ):

                image_url = upload_image(
                    image_file,
                    image_file.name,
                    folder=f"/products/{product.id}",
                )

                if not image_url:
                    raise serializers.ValidationError(
                        "Failed to upload product image."
                    )

                label = (
                    image_labels[index]
                    if index < len(image_labels)
                    else ""
                )

                ProductImage.objects.create(
                    product=product,
                    image=image_url,
                    label=label,
                    is_primary=(index == 0),
                    order=index,
                )

        return product

    # ---------------------------------------------------------
    # Update
    # ---------------------------------------------------------

    def update(
        self,
        instance,
        validated_data,
    ):

        uploaded_images = validated_data.pop(
            "uploaded_images",
            [],
        )

        image_labels = validated_data.pop(
            "image_labels",
            [],
        )

        size_labels = validated_data.pop(
            "size_labels",
            None,
        )

        categories = validated_data.pop(
            "categories",
            None,
        )

        with transaction.atomic():

            # Regular Product fields
            for attr, value in validated_data.items():

                setattr(
                    instance,
                    attr,
                    value,
                )

            instance.save()

            # Categories
            if categories is not None:
                instance.categories.set(categories)

            # Sizes
            if size_labels is not None:

                instance.sizes.all().delete()

                for label in size_labels:

                    ProductSize.objects.create(
                        product=instance,
                        label=label,
                    )

            # New images
            if uploaded_images:

                start_order = instance.images.count()

                for index, image_file in enumerate(
                    uploaded_images
                ):

                    image_url = upload_image(
                        image_file,
                        image_file.name,
                        folder=f"/products/{instance.id}",
                    )

                    if not image_url:
                        raise serializers.ValidationError(
                            "Failed to upload product image."
                        )

                    label = (
                        image_labels[index]
                        if index < len(image_labels)
                        else ""
                    )

                    ProductImage.objects.create(
                        product=instance,
                        image=image_url,
                        label=label,
                        is_primary=(
                            start_order == 0
                            and index == 0
                        ),
                        order=start_order + index,
                    )

        return instance


class ProductPriceUpdateSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = Product

        fields = [
            "price",
        ]

    def validate_price(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "Price must be greater than zero."
            )

        return value


class ProductStatusUpdateSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = Product

        fields = [
            "is_active",
        ]