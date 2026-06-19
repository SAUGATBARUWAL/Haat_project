from imagekitio import ImageKit
from django.conf import settings

client = ImageKit(
    private_key=settings.IMAGEKIT_PRIVATE_KEY,
)


def upload_image(file_obj, file_name, folder=None):
    """
    Uploads a file to ImageKit and returns the hosted URL.

    file_obj: a file-like object (e.g. request.FILES['image'])
    file_name: desired file name in ImageKit
    folder: optional folder path, e.g. "/users/profile_pictures/"
    """
    file_bytes = file_obj.read()

    response = client.files.upload(
        file=file_bytes,
        file_name=file_name,
        folder=folder or "/",
    )

    return response.url