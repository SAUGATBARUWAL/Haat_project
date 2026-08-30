from django.conf import settings
from imagekitio import ImageKit


client = ImageKit(
    private_key=settings.IMAGEKIT_PRIVATE_KEY,
)


def upload_image(
    file_obj,
    file_name,
    folder=None,
):
    """
    Upload an image to ImageKit.

    Returns:
        str: Hosted ImageKit URL
    """

    if file_obj is None:
        raise ValueError(
            "No image file was provided."
        )

    try:

        # Make sure we read from the beginning
        file_obj.seek(0)

        file_bytes = file_obj.read()

        if not file_bytes:
            raise ValueError(
                "The uploaded image is empty."
            )

        response = client.files.upload(
            file=file_bytes,
            file_name=file_name,
            folder=folder or "/",
        )

        image_url = getattr(
            response,
            "url",
            None,
        )

        if not image_url:
            raise RuntimeError(
                "ImageKit did not return an image URL."
            )

        return image_url

    except Exception as exc:

        raise RuntimeError(
            f"Image upload failed: {exc}"
        ) from exc