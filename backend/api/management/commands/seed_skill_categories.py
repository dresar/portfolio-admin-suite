from django.core.management.base import BaseCommand
from api.models import SkillCategory, Skill
import random

class Command(BaseCommand):
    help = 'Seeds skill categories and assigns skills to them'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding skill categories...')
        
        categories_data = [
            'Frontend Development',
            'Backend Development',
            'Database Management',
            'DevOps & Cloud',
            'Soft Skills'
        ]
        
        created_categories = []
        for cat_name in categories_data:
            category, created = SkillCategory.objects.get_or_create(name=cat_name)
            created_categories.append(category)
            if created:
                self.stdout.write(f'Created category: {cat_name}')
            else:
                self.stdout.write(f'Category already exists: {cat_name}')
                
        self.stdout.write('Seeding dummy skills...')
        
        skills_data = [
            'React', 'Vue.js', 'Angular', 'Next.js', 'Tailwind CSS',
            'Python', 'Django', 'Node.js', 'Express', 'Go',
            'PostgreSQL', 'MongoDB', 'MySQL', 'Redis',
            'Docker', 'Kubernetes', 'AWS', 'CI/CD',
            'Communication', 'Leadership', 'Problem Solving'
        ]
        
        # Clear existing skills to avoid duplicates/confusion for this dummy run
        Skill.objects.all().delete()
        
        for skill_name in skills_data:
            # Randomly assign a category
            category = random.choice(created_categories)
            
            # Try to match logically if possible (simple heuristic)
            if skill_name in ['React', 'Vue.js', 'Angular', 'Next.js', 'Tailwind CSS']:
                category = SkillCategory.objects.get(name='Frontend Development')
            elif skill_name in ['Python', 'Django', 'Node.js', 'Express', 'Go']:
                category = SkillCategory.objects.get(name='Backend Development')
            elif skill_name in ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis']:
                category = SkillCategory.objects.get(name='Database Management')
            elif skill_name in ['Docker', 'Kubernetes', 'AWS', 'CI/CD']:
                category = SkillCategory.objects.get(name='DevOps & Cloud')
            elif skill_name in ['Communication', 'Leadership', 'Problem Solving']:
                category = SkillCategory.objects.get(name='Soft Skills')
            
            Skill.objects.create(
                name=skill_name,
                category=category,
                percentage=random.randint(60, 100)
            )
            self.stdout.write(f'Created skill: {skill_name} in {category.name}')
            
        self.stdout.write(self.style.SUCCESS('Successfully seeded skill categories and skills'))
