from rest_framework import serializers
from .models import Profile, HomeContent, AboutContent, SocialLink, Skill, Experience, Education, Project, Certificate, Message, SiteSettings, ProjectImage, ProjectCategory, Subscriber, SkillCategory, CertificateCategory, WATemplate, BlockEntry, BlogCategory, BlogPost, ProjectSummary, AIKey
import ipaddress
import re

class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = '__all__'

class ProjectCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectCategory
        fields = '__all__'

class CertificateCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CertificateCategory
        fields = '__all__'

class SkillCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillCategory
        fields = '__all__'

class HomeContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeContent
        fields = '__all__'

class AboutContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutContent
        fields = '__all__'

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'

class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = '__all__'

class SkillSerializer(serializers.ModelSerializer):
    category_details = SkillCategorySerializer(source='category', read_only=True)
    
    class Meta:
        model = Skill
        fields = '__all__'

class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = '__all__'

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'

class ProjectImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectImage
        fields = ['id', 'image', 'image_url', 'caption', 'order']

class ProjectSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectSummary
        fields = ['id', 'content', 'version']

class ProjectSerializer(serializers.ModelSerializer):
    images = ProjectImageSerializer(many=True, read_only=True)
    category_details = ProjectCategorySerializer(source='category', read_only=True)
    summaries = ProjectSummarySerializer(many=True, read_only=True)
    thumbnail = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = '__all__'
        extra_kwargs = {
            'slug': {'required': False},
            'order': {'required': False}
        }

    def get_thumbnail(self, obj):
        if obj.cover_image:
            try:
                return obj.cover_image.url
            except:
                return None
        if obj.cover_image_url:
            return obj.cover_image_url
        
        # Fallback to first gallery image
        # Note: 'images' is the related_name for ProjectImage
        # Use .all()[0] if preloaded or .first()
        images = getattr(obj, 'images_prefetched', None)
        if images:
             first_image = images[0]
        else:
             first_image = obj.images.first()
             
        if first_image:
            if first_image.image:
                try:
                    return first_image.image.url
                except:
                    return None
            if first_image.image_url:
                return first_image.image_url
        return None

    def get_image(self, obj):
        return self.get_thumbnail(obj)

class CertificateSerializer(serializers.ModelSerializer):
    category_details = CertificateCategorySerializer(source='category', read_only=True)
    
    class Meta:
        model = Certificate
        fields = '__all__'

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'

class SubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscriber
        fields = '__all__'

class WATemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WATemplate
        fields = '__all__'


class BlockEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlockEntry
        fields = '__all__'

    def validate(self, attrs):
        entry_type = attrs.get("type")
        value = (attrs.get("value") or "").strip()
        if entry_type == "ip":
            try:
                ipaddress.ip_address(value)
            except ValueError:
                raise serializers.ValidationError({"value": "IP address tidak valid"})
        elif entry_type == "domain":
            pattern = r"^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))*$"
            if not re.match(pattern, value):
                raise serializers.ValidationError({"value": "Domain tidak valid"})
        else:
            raise serializers.ValidationError({"type": "Tipe blocklist tidak dikenal"})
        attrs["value"] = value
        return attrs


class BlogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = '__all__'


class BlogPostSerializer(serializers.ModelSerializer):
    category_details = BlogCategorySerializer(source='category', read_only=True)

    class Meta:
        model = BlogPost
        fields = '__all__'

class AIKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = AIKey
        fields = '__all__'
        read_only_fields = ['last_used', 'error_count', 'created_at']
