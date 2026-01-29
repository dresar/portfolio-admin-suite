import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify
from api.models import Project, ProjectCategory, ProjectImage

class Command(BaseCommand):
    help = 'Reset database and seed with dummy project data'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('Cleaning existing project data...'))
        
        # 1. Reset Data
        ProjectImage.objects.all().delete()
        Project.objects.all().delete()
        ProjectCategory.objects.all().delete()

        self.stdout.write(self.style.SUCCESS('Data cleaned. Starting seed...'))

        # 2. Setup Categories
        categories_data = [
            "Web Development",  # Kategori 1
            "Mobile Apps",      # Kategori 2
            "UI/UX Design"      # Kategori 3
        ]

        # Resources for randomness
        tech_stacks = ['React', 'TypeScript', 'Django', 'Python', 'Node.js', 'Tailwind', 'PostgreSQL', 'Docker', 'AWS', 'Figma', 'Flutter', 'Kotlin']
        
        # Image Providers (using Picsum for reliability)
        def get_random_image(id_seed):
            return f"https://picsum.photos/seed/{id_seed}/800/600"

        # Valid YouTube Links (Programming/Tech related)
        youtube_links = [
            "https://www.youtube.com/watch?v=kUMe1FH4CHE", # Learn HTML
            "https://www.youtube.com/watch?v=SqcY0GlETPk", # React Tutorial
            "https://www.youtube.com/watch?v=F6CrM6J-dbU", # Django Tutorial
        ]

        created_projects = 0

        # 3. Generate Data
        for cat_name in categories_data:
            # Create Category
            category = ProjectCategory.objects.create(
                name=cat_name,
                slug=slugify(cat_name)
            )
            self.stdout.write(f"Created Category: {cat_name}")

            # Create 15 Projects per Category
            for i in range(1, 16):
                # Random Date (last 30 days)
                days_ago = random.randint(0, 30)
                created_date = timezone.now() - timedelta(days=days_ago)
                
                # Random Tech Stack (3-5 items)
                project_stack = random.sample(tech_stacks, k=random.randint(3, 5))
                
                # Rich Text Content
                detail_content = f"""
                <h3>About This Project</h3>
                <p>This is a comprehensive dummy project generated for testing purposes. It simulates a real-world application in the <strong>{cat_name}</strong> domain. The project focuses on solving core user problems through intuitive design and robust engineering.</p>
                <p>Key challenges included handling large datasets and ensuring sub-second response times. We utilized modern caching strategies and optimized database queries to achieve this.</p>
                <h3>Technical Implementation</h3>
                <ul>
                    <li>Implemented secure authentication using JWT.</li>
                    <li>Designed a responsive UI mobile-first approach.</li>
                    <li>Integrated third-party APIs for payment processing.</li>
                </ul>
                <p>The outcome was a 40% increase in user engagement and positive feedback from early adopters.</p>
                """

                project = Project.objects.create(
                    title=f"{cat_name} Project {i}: {random.choice(['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega'])} System",
                    description=f"A high-performance {cat_name.lower()} solution designed to optimize workflow and enhance user productivity. Built with modern technologies.",
                    content=detail_content,
                    category=category,
                    thumbnail=get_random_image(f"{category.slug}-{i}"),
                    video_url=random.choice(youtube_links),
                    demoUrl="https://example.com/demo",
                    repoUrl="https://github.com/example/repo",
                    techStack=project_stack,
                    is_featured=random.choice([True, False]),
                    order=i
                )
                
                # Manually set created_at (since auto_now_add handles creation)
                project.createdAt = created_date
                project.save()
                
                created_projects += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully created {created_projects} projects across {len(categories_data)} categories.'))
