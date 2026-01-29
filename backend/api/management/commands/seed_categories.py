from django.core.management.base import BaseCommand
from api.models import ProjectCategory

class Command(BaseCommand):
    help = 'Seeds default Project categories'

    def handle(self, *args, **kwargs):
        categories = {
            'web': 'Web App',
            'mobile': 'Mobile App',
            'uiux': 'UI/UX Design',
            'other': 'Lainnya'
        }
        
        for slug, name in categories.items():
            cat, created = ProjectCategory.objects.get_or_create(
                slug=slug,
                defaults={'name': name}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created category: {name}'))
            else:
                self.stdout.write(f'Category already exists: {name}')
                
        self.stdout.write(self.style.SUCCESS('Successfully seeded categories'))
