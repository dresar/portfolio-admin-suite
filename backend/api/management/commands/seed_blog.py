import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify
from api.models import BlogPost, BlogCategory

class Command(BaseCommand):
    help = 'Seed database with dummy blog data'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('Cleaning existing blog data...'))
        
        # 1. Reset Data
        BlogPost.objects.all().delete()
        BlogCategory.objects.all().delete()

        self.stdout.write(self.style.SUCCESS('Data cleaned. Starting seed...'))

        # 2. Setup Categories
        categories_data = [
            "Technology",
            "Tutorials",
            "Career Advice",
            "Life Hacks",
            "Web Development"
        ]

        # Resources for randomness
        keywords_pool = ['react', 'python', 'django', 'javascript', 'coding', 'programming', 'web', 'frontend', 'backend', 'fullstack']
        
        # Image Providers (using Picsum for reliability)
        def get_random_image(id_seed):
            return f"https://picsum.photos/seed/{id_seed}/800/600"

        # Content Template
        def get_content(title, category):
            return f"""
            <h2>Introduction</h2>
            <p>Welcome to this comprehensive guide about <strong>{title}</strong>. In this article, we will explore the key concepts and practical applications of this topic in the realm of {category}.</p>
            
            <p><img src="{get_random_image(title + '-1')}" alt="Illustration 1" /></p>

            <h3>Why This Matters</h3>
            <p>Understanding these principles is crucial for modern developers. Whether you are a beginner or an expert, mastering these skills will significantly enhance your productivity.</p>

            <h3>Key Takeaways</h3>
            <ul>
                <li>Fundamental concepts explained simply.</li>
                <li>Real-world examples and use cases.</li>
                <li>Best practices for implementation.</li>
            </ul>

            <p><img src="{get_random_image(title + '-2')}" alt="Illustration 2" /></p>

            <h3>Deep Dive</h3>
            <p>Let's look closer at the implementation details. The code structure should be clean and maintainable. Always consider scalability when designing your solutions.</p>

            <iframe width="560" height="315" src="https://www.youtube.com/embed/kUMe1FH4CHE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

            <h3>Conclusion</h3>
            <p>We hope this article has provided you with valuable insights. Keep practicing and exploring new technologies!</p>
            """

        created_posts = 0

        # 3. Generate Data
        for cat_name in categories_data:
            # Create Category
            category = BlogCategory.objects.create(
                name=cat_name,
                slug=slugify(cat_name)
            )
            self.stdout.write(f"Created Category: {cat_name}")

            # Create 4 Posts per Category (Total 20)
            for i in range(1, 5):
                title = f"The Future of {cat_name}: Insight {i}"
                slug = slugify(title)
                
                # Random Date (last 60 days)
                days_ago = random.randint(0, 60)
                created_date = timezone.now() - timedelta(days=days_ago)
                
                # SEO Keywords
                seo_keywords = random.sample(keywords_pool, k=3)

                post = BlogPost.objects.create(
                    title=title,
                    slug=slug,
                    excerpt=f"Discover the latest trends and techniques in {cat_name}. This article covers everything you need to know about Insight {i}.",
                    content=get_content(title, cat_name),
                    category=category,
                    coverImage=get_random_image(f"{slug}-cover"),
                    is_published=True,
                    published_at=created_date,
                    seo_title=title,
                    seo_description=f"Learn about {title} in this detailed guide.",
                    seo_keywords=seo_keywords
                )
                
                # Manually set created_at
                post.created_at = created_date
                post.save()
                
                created_posts += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully created {created_posts} blog posts across {len(categories_data)} categories.'))
