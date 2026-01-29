from django.core.management.base import BaseCommand
from api.models import Project, ProjectCategory

class Command(BaseCommand):
    help = 'Migrates Project categories to ProjectCategory model'

    def handle(self, *args, **kwargs):
        # Create default categories
        categories = {
            'web': 'Web App',
            'mobile': 'Mobile',
            'uiux': 'UI/UX',
            'other': 'Other'
        }
        
        cat_objects = {}
        for slug, name in categories.items():
            cat, created = ProjectCategory.objects.get_or_create(
                slug=slug,
                defaults={'name': name}
            )
            cat_objects[slug] = cat
            if created:
                self.stdout.write(f'Created category: {name}')

        # Update projects
        projects = Project.objects.all()
        for project in projects:
            old_cat = project.category
            if old_cat in cat_objects:
                project.new_category = cat_objects[old_cat]
                project.save()
                self.stdout.write(f'Updated project "{project.title}" to category "{cat_objects[old_cat].name}"')
            else:
                # Default to Other if unknown or empty
                if not project.new_category:
                    project.new_category = cat_objects['other']
                    project.save()
                    self.stdout.write(f'Updated project "{project.title}" to default category "Other"')
        
        self.stdout.write(self.style.SUCCESS('Successfully migrated categories'))
