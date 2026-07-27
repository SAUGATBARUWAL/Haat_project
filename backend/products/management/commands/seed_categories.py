from django.core.management.base import BaseCommand
from products.models import Category

DEFAULT_CATEGORIES = ["Fashion", "Groceries", "Furniture", "Electronics", "Sports"]


class Command(BaseCommand):
    help = "Creates the default product categories if they don't already exist."

    def handle(self, *args, **options):
        created = 0
        for name in DEFAULT_CATEGORIES:
            _, was_created = Category.objects.get_or_create(name=name)
            if was_created:
                created += 1
        self.stdout.write(self.style.SUCCESS(f"Done. {created} new categories created."))