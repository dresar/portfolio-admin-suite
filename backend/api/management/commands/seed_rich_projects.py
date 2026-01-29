import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify
from api.models import Project, ProjectCategory, ProjectImage, ProjectSummary

class Command(BaseCommand):
    help = 'Reset database and seed with 20 rich projects using CDN links and Markdown content'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('Cleaning existing project data...'))
        
        # 1. Reset Data
        ProjectSummary.objects.all().delete()
        ProjectImage.objects.all().delete()
        Project.objects.all().delete()
        ProjectCategory.objects.all().delete()

        self.stdout.write(self.style.SUCCESS('Data cleaned. Starting seed...'))

        # 2. Setup Categories
        categories_data = [
            "Web Development",
            "Mobile Apps",
            "UI/UX Design",
            "AI & Machine Learning"
        ]
        
        categories_objs = []
        for cat_name in categories_data:
            cat, created = ProjectCategory.objects.get_or_create(
                name=cat_name,
                defaults={'slug': slugify(cat_name)}
            )
            categories_objs.append(cat)
            self.stdout.write(f"Category: {cat_name}")

        # Resources
        tech_stacks = ['React', 'TypeScript', 'Django', 'Python', 'Node.js', 'Tailwind', 'PostgreSQL', 'Docker', 'AWS', 'Figma', 'Flutter', 'Kotlin', 'Next.js', 'GraphQL', 'Redis']
        
        # Unsplash Images (High quality tech/design images)
        # Using specific IDs to ensure they work
        unsplash_ids = [
            "1498050108023-c5249f4df085", # Laptop code
            "1460925895917-afdab827c52f", # Abstract data
            "1555066931-4365d14bab8c", # Coding
            "1517694712202-14dd9538aa97", # Computer
            "1550745165-9bc0b252726f", # Desk
            "1550439062-609f15a2c7cf", # Meeting
            "1531403009284-440f080d1e12", # Design
            "1523240795612-9a054b0db644", # Friends
            "1522071820081-009f0129c71c", # Office
            "1504384308090-c54beed04a58", # Working
        ]

        def get_image_url(index):
            img_id = unsplash_ids[index % len(unsplash_ids)]
            return f"https://images.unsplash.com/photo-{img_id}?auto=format&fit=crop&w=1200&q=80"

        # YouTube Links (Mix of tech talks/tutorials)
        youtube_links = [
            "https://www.youtube.com/watch?v=kUMe1FH4CHE",
            "https://www.youtube.com/watch?v=SqcY0GlETPk",
            "https://www.youtube.com/watch?v=F6CrM6J-dbU",
            "https://www.youtube.com/watch?v=VqgUkExPvLY",
            "https://www.youtube.com/watch?v=30LWjhZzg50",
            "https://www.youtube.com/watch?v=T947QLsQzig",
            "https://www.youtube.com/watch?v=rfscVS0vtbw",
        ]
        
        def get_video_embed(url):
            # Simple converter for demo
            if "watch?v=" in url:
                vid_id = url.split("watch?v=")[1]
                return f"https://www.youtube.com/embed/{vid_id}"
            return url

        # 3. Generate 20 Projects
        total_projects_to_create = 20
        
        for i in range(1, total_projects_to_create + 1):
            category = random.choice(categories_objs)
            
            # Random Tech Stack (3-6 items)
            project_stack = random.sample(tech_stacks, k=random.randint(3, 6))
            
            # 5 Video URLs per project as requested
            project_videos = random.sample(youtube_links * 2, k=5) 
            
            # Markdown Content
            md_content = f"""
# Project Overview

This is a comprehensive demonstration of a **{category.name}** project. It was built to solve complex problems using modern architecture.

## Key Features
- **Real-time Synchronization**: Built with WebSockets.
- **Responsive Design**: Mobile-first approach using Tailwind CSS.
- **Secure Authentication**: OAuth2 and JWT implementation.
- **Cloud Native**: Deployed on AWS with Docker containers.

## Technical Challenges
We faced significant challenges in *optimizing database queries* for high-volume data. By implementing Redis caching, we reduced latency by 60%.

```python
# Example of the optimization logic
def get_cached_data(key):
    if redis.exists(key):
        return redis.get(key)
    data = db.query(...)
    redis.set(key, data)
    return data
```

## Future Roadmap
1. [ ] Add AI-powered recommendations
2. [ ] Integrate payment gateway
3. [ ] Launch mobile app version

> "This project represents the pinnacle of our engineering efforts this year." - Lead Developer
            """

            project = Project.objects.create(
                title=f"Project {i}: {random.choice(['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega', 'Zeta', 'Sigma'])} {category.name.split()[0]}",
                description=f"A cutting-edge {category.name} solution featuring robust performance and intuitive UX. Designed to scale with user growth.",
                content=md_content,
                category=category,
                
                # Media
                cover_image_url=get_image_url(i),
                video_embed_url=get_video_embed(project_videos[0]),
                
                # Lists
                tech=project_stack,
                demo_urls=[f"https://demo-project-{i}.example.com", f"https://staging-project-{i}.example.com"],
                repo_urls=[f"https://github.com/username/project-{i}-frontend", f"https://github.com/username/project-{i}-backend"],
                video_urls=project_videos, # 5 Videos here
                featured_links=[
                    {"label": "Documentation", "url": f"https://docs.project-{i}.com"},
                    {"label": "Case Study", "url": f"https://blog.project-{i}.com/case-study"}
                ],
                
                # SEO
                seo_title=f"Best {category.name} Project {i} - Portfolio Showcase",
                seo_description=f"Discover how Project {i} revolutionizes {category.name} with modern tech stack like {', '.join(project_stack[:3])}.",
                seo_keywords=["portfolio", category.name, "development"] + project_stack[:3],
                
                # Meta
                is_published=True,
                publish_at=timezone.now() - timedelta(days=random.randint(1, 100)),
                order=i
            )

            # Create Gallery Images (3-5 per project)
            for j in range(random.randint(3, 5)):
                ProjectImage.objects.create(
                    project=project,
                    image_url=get_image_url(i + j + 10), # Offset to get different images
                    caption=f"Screenshot {j+1} - {random.choice(['Dashboard', 'Mobile View', 'Settings', 'Analytics'])}",
                    order=j
                )

            self.stdout.write(f"Created Project {i}: {project.title}")

        self.stdout.write(self.style.SUCCESS(f'Successfully created {total_projects_to_create} rich projects with full data.'))
