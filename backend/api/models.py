from django.db import models
from django.utils import timezone
from .utils import translate_text
import json

class SiteSettings(models.Model):
    theme = models.CharField(max_length=20, default='dark')
    seoTitle = models.CharField(max_length=200, default='My Portfolio')
    seoDesc = models.TextField(default='Welcome to my portfolio')
    cdn_url = models.URLField(blank=True, null=True, help_text="Base URL for CDN (e.g. https://cdn.example.com)")
    maintenanceMode = models.BooleanField(default=False)
    maintenance_end_time = models.DateTimeField(blank=True, null=True, help_text="Auto turn off maintenance mode after this time")
    
    # AI Settings
    ai_provider = models.CharField(max_length=20, default='gemini', choices=[('gemini', 'Google Gemini'), ('groq', 'Groq')])
    
    def save(self, *args, **kwargs):
        if not self.pk and SiteSettings.objects.exists():
            return SiteSettings.objects.first()
        return super(SiteSettings, self).save(*args, **kwargs)

    def __str__(self):
        return "Site Settings"

class HomeContent(models.Model):
    greeting_id = models.CharField(max_length=100, default="Halo, Saya")
    greeting_en = models.CharField(max_length=100, blank=True)
    
    # Roles are stored as JSON list ["Developer", "Designer"]
    # We'll store two separate lists or one object? Let's use two fields for simplicity
    roles_id = models.TextField(default='["Pengembang", "Desainer"]')
    roles_en = models.TextField(blank=True, default='[]')
    
    heroImage = models.CharField(max_length=500, blank=True, null=True)
    heroImageFile = models.ImageField(upload_to='profile/', blank=True, null=True)
    
    def save(self, *args, **kwargs):
        # Auto-translate greeting
        if self.greeting_id and not self.greeting_en:
            self.greeting_en = translate_text(self.greeting_id, 'en', 'id')
            
        # Auto-translate roles if possible (this is tricky with JSON)
        # Assuming input is valid JSON list
        if self.roles_id and (not self.roles_en or self.roles_en == '[]'):
            try:
                roles_list = json.loads(self.roles_id)
                translated_roles = []
                for role in roles_list:
                    translated_roles.append(translate_text(role, 'en', 'id'))
                self.roles_en = json.dumps(translated_roles)
            except:
                pass # If JSON parsing fails, skip translation
                
        # Singleton check
        if not self.pk and HomeContent.objects.exists():
            return HomeContent.objects.first()
        return super(HomeContent, self).save(*args, **kwargs)

    def __str__(self):
        return "Home Content"

class AboutContent(models.Model):
    # Short description (max 150 chars)
    short_description_id = models.CharField(max_length=150, blank=True)
    short_description_en = models.CharField(max_length=150, blank=True)
    
    # Long description (unlimited)
    long_description_id = models.TextField(blank=True)
    long_description_en = models.TextField(blank=True)
    
    aboutImage = models.CharField(max_length=500, blank=True, null=True)
    aboutImageFile = models.ImageField(upload_to='profile/', blank=True, null=True)
    
    def save(self, *args, **kwargs):
        # Auto-translate short desc
        if self.short_description_id and not self.short_description_en:
            self.short_description_en = translate_text(self.short_description_id, 'en', 'id')
            
        # Auto-translate long desc
        if self.long_description_id and not self.long_description_en:
            self.long_description_en = translate_text(self.long_description_id, 'en', 'id')

        # Singleton check
        if not self.pk and AboutContent.objects.exists():
            return AboutContent.objects.first()
        return super(AboutContent, self).save(*args, **kwargs)

    def __str__(self):
        return "About Content"

class Profile(models.Model):
    fullName = models.CharField(max_length=200)
    greeting = models.CharField(max_length=200, blank=True)
    role = models.TextField(blank=True, default='[]') # Changed to TextField to support multiple roles as JSON string
    bio = models.TextField(blank=True, default='')
    heroImage = models.CharField(max_length=500, blank=True, null=True)
    heroImageFile = models.ImageField(upload_to='profile/', blank=True, null=True)
    aboutImage = models.CharField(max_length=500, blank=True, null=True)
    aboutImageFile = models.ImageField(upload_to='profile/', blank=True, null=True)
    resumeUrl = models.CharField(max_length=500, blank=True, null=True)
    resumeFile = models.FileField(upload_to='resume/', blank=True, null=True)
    location = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    
    # Custom Stats
    stats_project_count = models.CharField(max_length=50, blank=True, null=True, help_text="Override project count display (e.g. '15+')")
    stats_exp_years = models.CharField(max_length=50, blank=True, null=True, help_text="Override experience years display (e.g. '5+')")
    
    # Map Embed URL (e.g. Google Maps iframe src)
    map_embed_url = models.TextField(blank=True, null=True, help_text="Google Maps Embed URL (iframe src)")
    
    def __str__(self):
        return self.fullName

class SocialLink(models.Model):
    platform = models.CharField(max_length=50)
    url = models.URLField()
    icon = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.platform

class SkillCategory(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Skill(models.Model):
    name = models.CharField(max_length=100)
    # Changed from CharField to ForeignKey
    category = models.ForeignKey(SkillCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='skills')
    percentage = models.IntegerField(default=0)
    
    def __str__(self):
        return self.name

class Experience(models.Model):
    role = models.CharField(max_length=100)
    company = models.CharField(max_length=100)
    description = models.TextField()
    startDate = models.DateField()
    endDate = models.DateField(null=True, blank=True)
    isCurrent = models.BooleanField(default=False)
    location = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.role} at {self.company}"

class Education(models.Model):
    institution = models.CharField(max_length=100)
    degree = models.CharField(max_length=100)
    field = models.CharField(max_length=100)
    startDate = models.DateField()
    endDate = models.DateField(null=True, blank=True)
    gpa = models.CharField(max_length=10, blank=True, null=True)
    logo = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    attachments = models.JSONField(default=list, blank=True)
    gallery = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.degree} at {self.institution}"

class ProjectCategory(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Project(models.Model):
    title = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, default='') # Keeping for summary
    content = models.TextField(blank=True, default='') # Rich text content
    
    # Media (File + URL options)
    cover_image = models.ImageField(upload_to='projects/covers/', blank=True, null=True)
    cover_image_url = models.CharField(max_length=500, blank=True, null=True)
    
    video_file = models.FileField(upload_to='projects/videos/', blank=True, null=True)
    video_embed_url = models.CharField(max_length=500, blank=True, null=True, help_text="YouTube/Vimeo URL for main video")
    
    # Tech stack as list of strings
    tech = models.JSONField(default=list, blank=True)
    
    category = models.ForeignKey(ProjectCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='projects')
    
    # Flexible lists of URLs
    demo_urls = models.JSONField(default=list, blank=True)
    repo_urls = models.JSONField(default=list, blank=True)
    video_urls = models.JSONField(default=list, blank=True) # Additional video links
    featured_links = models.JSONField(default=list, blank=True) # Array of {label, url}
    
    # SEO Fields
    seo_title = models.CharField(max_length=200, blank=True)
    seo_description = models.TextField(blank=True)
    seo_keywords = models.JSONField(default=list, blank=True)
    
    order = models.IntegerField(default=0)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=True)
    publish_at = models.DateTimeField(blank=True, null=True)

    def save(self, *args, **kwargs):
        # Auto-set slug
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.title)
            
        # Auto-set order if 0 (put at end)
        if self.order == 0:
            max_order = Project.objects.aggregate(models.Max('order'))['order__max']
            self.order = (max_order or 0) + 1

        # Auto-set publish_at if published and not set
        if self.is_published and not self.publish_at:
            self.publish_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class ProjectSummary(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='summaries')
    content = models.TextField()
    version = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['version']
        
    def __str__(self):
        return f"Summary v{self.version} for {self.project.title}"

class ProjectImage(models.Model):
    project = models.ForeignKey(Project, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='projects/gallery/', blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True)
    caption = models.CharField(max_length=200, blank=True)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']

class CertificateCategory(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Certificate(models.Model):
    name = models.CharField(max_length=100)
    issuer = models.CharField(max_length=100)
    issueDate = models.DateField()
    expiryDate = models.DateField(null=True, blank=True)
    credentialUrl = models.URLField(blank=True, null=True)
    image = models.URLField(blank=True, null=True)
    verified = models.BooleanField(default=False)
    credentialId = models.CharField(max_length=100, blank=True, null=True)
    category = models.ForeignKey(CertificateCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='certificates')

    def __str__(self):
        return self.name

class Message(models.Model):
    senderName = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    isRead = models.BooleanField(default=False)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.senderName}"

class Subscriber(models.Model):
    email = models.EmailField(unique=True)
    status = models.CharField(max_length=20, default='active', choices=[('active', 'Active'), ('unsubscribed', 'Unsubscribed')])
    subscribedAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email

class WATemplate(models.Model):
    template_name = models.CharField(max_length=100)
    template_content = models.TextField()
    category = models.CharField(max_length=50, default='General')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.template_name


class BlockEntry(models.Model):
    TYPE_CHOICES = [
        ("ip", "IP Address"),
        ("domain", "Domain"),
    ]
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    value = models.CharField(max_length=255)
    reason = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.type}:{self.value}"


class BlogCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class BlogPost(models.Model):
    category = models.ForeignKey(BlogCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts')
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    excerpt = models.TextField(blank=True)
    content = models.TextField()
    coverImage = models.CharField(max_length=500, blank=True, null=True)
    coverImageFile = models.ImageField(upload_to='blog/covers/', blank=True, null=True)
    tags = models.JSONField(default=list, blank=True)
    is_published = models.BooleanField(default=False)
    publish_at = models.DateTimeField(blank=True, null=True)
    published_at = models.DateTimeField(blank=True, null=True)
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.TextField(blank=True)
    seo_keywords = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.is_published and self.publish_at is None and self.published_at is None:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)

class AIKey(models.Model):
    PROVIDER_CHOICES = [
        ('gemini', 'Google Gemini'),
        ('groq', 'Groq (Llama 3)'),
    ]
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES)
    key = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used = models.DateTimeField(null=True, blank=True)
    error_count = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.provider} - {self.key[:10]}..."
