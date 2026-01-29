from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.exceptions import ValidationError
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from django.conf import settings
from django.utils import timezone
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.core.signing import Signer
import json
import traceback
import os
from django.db.models import Q
from .models import Profile, HomeContent, AboutContent, SocialLink, Skill, Experience, Education, Project, Certificate, Message, SiteSettings, ProjectImage, ProjectCategory, Subscriber, SkillCategory, CertificateCategory, WATemplate, BlockEntry, BlogCategory, BlogPost
from .serializers import (
    ProfileSerializer, SocialLinkSerializer, SkillSerializer, 
    ExperienceSerializer, EducationSerializer, ProjectSerializer, 
    CertificateSerializer, MessageSerializer, SiteSettingsSerializer, HomeContentSerializer, AboutContentSerializer, ProjectCategorySerializer, SubscriberSerializer, SkillCategorySerializer, CertificateCategorySerializer, WATemplateSerializer, BlockEntrySerializer, BlogCategorySerializer, BlogPostSerializer, AIKeySerializer
)
from .models import AIKey

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    identifier = request.data.get('identifier')
    password = request.data.get('password')
    captcha = request.data.get('captcha')
    captcha_hash = request.data.get('captchaHash')
    
    if not identifier or not password:
        return Response({'error': 'Please provide both identifier and password'}, status=400)
    
    # Verify Captcha
    # if not captcha or not captcha_hash:
    #    return Response({'error': 'Captcha required'}, status=400)
        
    # signer = Signer()
    # try:
    #    original_code = signer.unsign(captcha_hash)
    #    if captcha.upper() != original_code:
    #         return Response({'error': 'Invalid captcha code'}, status=400)
    # except Exception:
    #    return Response({'error': 'Invalid captcha hash'}, status=400)
        
    try:
        user = User.objects.get(Q(email=identifier) | Q(username=identifier))
    except User.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=400)
        
    # Authenticate using the username found via email or username
    user = authenticate(username=user.username, password=password)
    
    if not user:
        return Response({'error': 'Invalid credentials'}, status=400)
        
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'user': {'id': user.id, 'email': user.email, 'name': user.username}})

@api_view(['GET'])
@permission_classes([AllowAny])
def get_captcha_api_view(request):
    import random
    import string
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    
    signer = Signer()
    signed_code = signer.sign(code)
    
    return Response({'captcha': code, 'hash': signed_code})

@api_view(['GET'])
@permission_classes([AllowAny])
def me_view(request):
    if request.user.is_authenticated:
        return Response({
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email
        })
    return Response({
        'id': None,
        'username': 'Guest',
        'email': ''
    })

class SiteSettingsViewSet(viewsets.ModelViewSet):
    queryset = SiteSettings.objects.all()
    serializer_class = SiteSettingsSerializer
    permission_classes = [IsAdminUser]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

    def list(self, request, *args, **kwargs):
        instance = self.get_queryset().first()
        
        # Auto-expire maintenance mode logic
        if instance and instance.maintenanceMode and instance.maintenance_end_time:
            if timezone.now() > instance.maintenance_end_time:
                instance.maintenanceMode = False
                instance.maintenance_end_time = None
                instance.save()
                
        if instance:
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        return Response({})

    def create(self, request, *args, **kwargs):
        if SiteSettings.objects.exists():
            instance = SiteSettings.objects.first()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        return super().create(request, *args, **kwargs)

class HomeContentViewSet(viewsets.ModelViewSet):
    queryset = HomeContent.objects.all()
    serializer_class = HomeContentSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        instance = self.get_queryset().first()
        if instance:
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        return Response({})

    def create(self, request, *args, **kwargs):
        if HomeContent.objects.exists():
            instance = HomeContent.objects.first()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        return super().create(request, *args, **kwargs)

class AboutContentViewSet(viewsets.ModelViewSet):
    queryset = AboutContent.objects.all()
    serializer_class = AboutContentSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    permission_classes = [AllowAny]
    
    def get_permissions(self):
        return [AllowAny()]

    def list(self, request, *args, **kwargs):
        instance = self.get_queryset().first()
        if instance:
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        return Response({})

    def create(self, request, *args, **kwargs):
        if AboutContent.objects.exists():
            instance = AboutContent.objects.first()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        return super().create(request, *args, **kwargs)

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        # Return the first profile object if exists, or empty
        instance = self.get_queryset().first()
        if instance:
            # Inject counts for frontend
            data = self.get_serializer(instance).data
            data['total_certificates'] = Certificate.objects.count()
            data['total_skills'] = Skill.objects.count()
            return Response(data)
        return Response({})

    def create(self, request, *args, **kwargs):
        try:
            # Handle potential JSON strings in FormData
            data = request.data.copy()
            if 'role' in data and isinstance(data['role'], str):
                try:
                    # If it's a JSON string, leave it as string for CharField/JSONField or parse it?
                    # If model is JSONField, we should parse it. If CharField, leave it.
                    # Currently model is CharField. But we might change it.
                    # Let's just leave it, or ensure it's valid.
                    pass
                except:
                    pass

            # Ensure only one profile exists
            if Profile.objects.exists():
                instance = Profile.objects.first()
                # Use partial=True to allow updating subsets of fields if needed
                serializer = self.get_serializer(instance, data=data, partial=True)
                serializer.is_valid(raise_exception=True)
                self.perform_update(serializer)
                return Response(serializer.data)
            return super().create(request, *args, **kwargs)
        except ValidationError as e:
            return Response(e.detail, status=400)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)

    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            
            # Debug logging
            print(f"Updating profile {instance.id} with data keys: {list(request.data.keys())}")
            
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            if not serializer.is_valid():
                print(f"Profile update validation errors: {serializer.errors}")
                return Response(serializer.errors, status=400)
                
            self.perform_update(serializer)
            return Response(serializer.data)
        except ValidationError as e:
            print(f"Validation error: {e}")
            return Response(e.detail, status=400)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)

class SocialLinkViewSet(viewsets.ModelViewSet):
    queryset = SocialLink.objects.all()
    serializer_class = SocialLinkSerializer
    permission_classes = [AllowAny]

class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [AllowAny]

class SkillCategoryViewSet(viewsets.ModelViewSet):
    queryset = SkillCategory.objects.all()
    serializer_class = SkillCategorySerializer
    permission_classes = [AllowAny]
    
    def get_permissions(self):
        return [AllowAny()]

class ExperienceViewSet(viewsets.ModelViewSet):
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer
    permission_classes = [AllowAny]

class EducationViewSet(viewsets.ModelViewSet):
    queryset = Education.objects.all()
    serializer_class = EducationSerializer
    permission_classes = [AllowAny]

class ProjectCategoryViewSet(viewsets.ModelViewSet):
    queryset = ProjectCategory.objects.all()
    serializer_class = ProjectCategorySerializer
    permission_classes = [AllowAny]
    
    def get_permissions(self):
        return [AllowAny()]

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().prefetch_related('images', 'summaries').order_by('order', '-createdAt')
    serializer_class = ProjectSerializer
    permission_classes = [AllowAny]
    
    def get_permissions(self):
        return [AllowAny()]

    def get_queryset(self):
        qs = super().get_queryset()
        request = self.request
        include_unpublished = request.query_params.get('include_unpublished')
        user = getattr(request, "user", None)
        if user and getattr(user, "is_staff", False):
            if include_unpublished == "0":
                now = timezone.now()
                return qs.filter(is_published=True).filter(Q(publish_at__isnull=True) | Q(publish_at__lte=now))
            return qs
        now = timezone.now()
        return qs.filter(is_published=True).filter(Q(publish_at__isnull=True) | Q(publish_at__lte=now))

    def create(self, request, *args, **kwargs):
        try:
            data = request.data.copy()
            
            # Handle empty category string from FormData
            if 'category' in data:
                if data['category'] == '' or data['category'] == 'null' or data['category'] == 'undefined':
                     data['category'] = None
                 
            # Parse JSON fields if they are strings (common in multipart)
            json_fields = ['tech', 'featured_links', 'demo_urls', 'repo_urls', 'video_urls']
            for field in json_fields:
                if field in data and isinstance(data[field], str):
                    try:
                        data[field] = json.loads(data[field])
                    except json.JSONDecodeError:
                        # If JSON load fails, and it's tech, maybe it's a comma separated string
                        if field == 'tech':
                            data[field] = [x.strip() for x in data[field].split(',') if x.strip()]
                        else:
                            # For other fields, if it's not valid JSON but required as JSON, we might want to let serializer complain or set default
                            pass
                    except Exception as e:
                        print(f"Error parsing {field}: {e}")
                        pass
            
            # Convert QueryDict to dict to avoid validation issues with JSONField when passing lists
            if hasattr(data, 'dict'):
                data = data.dict()
            
            serializer = self.get_serializer(data=data)
            if not serializer.is_valid():
                 print("Validation Error:", serializer.errors)
                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            # Avoid request.data.copy() due to Windows TemporaryFile bug
            data = request.data.dict() if hasattr(request.data, 'dict') else request.data
            if isinstance(data, dict):
                data = data.copy()
            
            # Explicitly ensure content is preserved
            if 'content' in request.data:
                data['content'] = request.data['content']
            
            # Handle empty category string from FormData
            if 'category' in data:
                if data['category'] == '' or data['category'] == 'null' or data['category'] == 'undefined':
                     data['category'] = None

            # Handle empty publish_at string from FormData
            if 'publish_at' in data:
                if data['publish_at'] == '' or data['publish_at'] == 'null' or data['publish_at'] == 'undefined':
                     data['publish_at'] = None
            
            json_fields = ['tech', 'featured_links', 'demo_urls', 'repo_urls', 'video_urls']
            for field in json_fields:
                if field in data and isinstance(data[field], str):
                    try:
                        data[field] = json.loads(data[field])
                    except json.JSONDecodeError:
                        # If JSON load fails, and it's tech, maybe it's a comma separated string
                        if field == 'tech':
                            data[field] = [x.strip() for x in data[field].split(',') if x.strip()]
                        else:
                            # For other fields, if it's not valid JSON but required as JSON, we might want to let serializer complain or set default
                            pass
                    except Exception as e:
                        print(f"Error parsing {field}: {e}")
                        pass
            
            # Convert QueryDict to dict to avoid validation issues with JSONField when passing lists
            if hasattr(data, 'dict'):
                # Handle specific fields that might need list preservation if any (none for ProjectSerializer fields)
                # Note: data.dict() takes the last value for each key, which is correct for single fields
                # including our manually parsed techStack/links which are now lists/dicts.
                data = data.dict()

            serializer = self.get_serializer(instance, data=data, partial=partial)
            if not serializer.is_valid():
                 print("Validation Error:", serializer.errors)
                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                 
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        project = serializer.save()
        self._handle_images(project)
        self._handle_summaries(project)
    
    def perform_update(self, serializer):
        project = serializer.save()
        self._handle_images(project)
        self._handle_summaries(project)

    def _handle_summaries(self, project):
        data = self.request.data
        if 'summaries' in data:
            try:
                summaries_data = data['summaries']
                if isinstance(summaries_data, str):
                    summaries_data = json.loads(summaries_data)
                
                if isinstance(summaries_data, list):
                    from .models import ProjectSummary
                    # Delete existing summaries and recreate
                    ProjectSummary.objects.filter(project=project).delete()
                    
                    for index, summary in enumerate(summaries_data):
                        ProjectSummary.objects.create(
                            project=project,
                            content=summary.get('content', ''),
                            version=index + 1
                        )
            except Exception as e:
                print(f"Error handling summaries: {e}")

    def _handle_images(self, project):
        # Handle uploaded images
        if self.request.FILES:
            images = self.request.FILES.getlist('uploaded_images')
            for image in images:
                ProjectImage.objects.create(project=project, image=image)
        
        # Handle image URLs (new feature)
        data = self.request.data
        if 'image_urls' in data:
            try:
                urls = data['image_urls']
                if isinstance(urls, str):
                    urls = json.loads(urls)
                
                if isinstance(urls, list):
                    for url in urls:
                        if url and isinstance(url, str):
                            ProjectImage.objects.create(project=project, image_url=url)
            except Exception as e:
                print(f"Error handling image URLs: {e}")

    @action(detail=True, methods=['post'])
    def delete_image(self, request, pk=None):
        try:
            image_id = request.data.get('image_id')
            if not image_id:
                return Response({'error': 'image_id is required'}, status=400)
            
            try:
                image = ProjectImage.objects.get(id=image_id, project_id=pk)
                image.delete()
                return Response({'status': 'deleted'})
            except ProjectImage.DoesNotExist:
                return Response({'error': 'Image not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    @action(detail=False, methods=['post'])
    def reorder(self, request):
        try:
            items = request.data.get('items', [])
            if not isinstance(items, list):
                return Response({'error': 'items must be a list'}, status=400)
            
            for item in items:
                try:
                    project_id = item.get('id')
                    new_order = item.get('order')
                    
                    if project_id is not None and new_order is not None:
                        project = Project.objects.get(id=project_id)
                        project.order = new_order
                        project.save()
                except Project.DoesNotExist:
                    continue
                except Exception as e:
                    print(f"Error updating project {item}: {e}")
                    
            return Response({'status': 'reordered'})
        except Exception as e:
            print(f"Reorder error: {e}")
            return Response({'error': str(e)}, status=500)

class CertificateViewSet(viewsets.ModelViewSet):
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer
    
    def get_permissions(self):
        return [AllowAny()]

class CertificateCategoryViewSet(viewsets.ModelViewSet):
    queryset = CertificateCategory.objects.all()
    serializer_class = CertificateCategorySerializer
    
    def get_permissions(self):
        return [AllowAny()]

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [AllowAny]

class SubscriberViewSet(viewsets.ModelViewSet):
    queryset = Subscriber.objects.all()
    serializer_class = SubscriberSerializer
    permission_classes = [AllowAny]

class WATemplateViewSet(viewsets.ModelViewSet):
    queryset = WATemplate.objects.all()
    serializer_class = WATemplateSerializer
    
    def get_permissions(self):
        return [AllowAny()]


class BlockEntryViewSet(viewsets.ModelViewSet):
    queryset = BlockEntry.objects.all().order_by("-created_at")
    serializer_class = BlockEntrySerializer
    permission_classes = [IsAdminUser]


class BlogCategoryViewSet(viewsets.ModelViewSet):
    queryset = BlogCategory.objects.all().order_by("name")
    serializer_class = BlogCategorySerializer
    permission_classes = [AllowAny]


class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all().select_related("category").order_by("-published_at", "-created_at")
    serializer_class = BlogPostSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        request = self.request
        include_unpublished = request.query_params.get("include_unpublished")
        user = getattr(request, "user", None)
        if user and getattr(user, "is_staff", False):
            if include_unpublished == "0":
                now = timezone.now()
                return qs.filter(is_published=True).filter(Q(publish_at__isnull=True) | Q(publish_at__lte=now))
            return qs
        now = timezone.now()
        return qs.filter(is_published=True).filter(Q(publish_at__isnull=True) | Q(publish_at__lte=now))

    @action(detail=False, methods=["get"])
    def by_slug(self, request):
        slug = request.query_params.get('slug')
        if not slug:
             return Response({"detail": "Slug parameter is required."}, status=400)
        
        qs = self.get_queryset()
        try:
            post = qs.get(slug=slug)
        except BlogPost.DoesNotExist:
            return Response({"detail": "Not found."}, status=404)
        serializer = self.get_serializer(post)
        return Response(serializer.data)


def read_log_file(date_str):
    base_dir = settings.BASE_DIR
    file_name = f"logs_{date_str}.json"
    file_path = base_dir / file_name
    if not os.path.exists(file_path):
        return []
    entries = []
    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entries.append(json.loads(line))
            except Exception:
                continue
    return entries


def filter_logs(entries, params):
    domain = (params.get("domain") or "").strip().lower()
    ip = (params.get("ip") or "").strip()
    endpoint = (params.get("endpoint") or "").strip()
    method = (params.get("method") or "").strip().upper()
    status = (params.get("status") or "").strip()
    blocked = params.get("blocked")
    result = []
    for entry in entries:
        if domain and str(entry.get("origin", "")).lower().find(domain) == -1 and str(entry.get("host", "")).lower().find(domain) == -1:
            continue
        if ip and str(entry.get("ip", "")) != ip:
            continue
        if endpoint and str(entry.get("path", "")).find(endpoint) == -1:
            continue
        if method and str(entry.get("method", "")).upper() != method:
            continue
        if status:
            try:
                if int(entry.get("status_code", 0)) != int(status):
                    continue
            except Exception:
                continue
        if blocked is not None and blocked != "":
            blocked_flag = str(blocked).lower() in ["1", "true", "yes"]
            if bool(entry.get("blocked", False)) != blocked_flag:
                continue
        result.append(entry)
    return result


def paginate_list(items, page, page_size):
    total = len(items)
    if page_size <= 0:
        page_size = 50
    total_pages = (total + page_size - 1) // page_size
    if page < 1:
        page = 1
    if total_pages > 0 and page > total_pages:
        page = total_pages
    start = (page - 1) * page_size
    end = start + page_size
    return items[start:end], total, total_pages


def build_stats(entries):
    per_hour = {}
    for entry in entries:
        ts = entry.get("timestamp")
        if not ts:
            continue
        try:
            dt = datetime_from_iso(ts)
            key = dt.strftime("%H:00")
        except Exception:
            key = "unknown"
        per_hour[key] = per_hour.get(key, 0) + 1
    return per_hour


def datetime_from_iso(value):
    try:
        if value.endswith("Z"):
            value = value[:-1]
        return timezone.datetime.fromisoformat(value)
    except Exception:
        return timezone.now()


def get_available_log_dates():
    base_dir = settings.BASE_DIR
    result = []
    for name in os.listdir(base_dir):
        if name.startswith("logs_") and name.endswith(".json"):
            date_part = name[5:-5]
            result.append(date_part)
    result.sort(reverse=True)
    return result


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def admin_login_view(request):
    if request.user.is_authenticated and request.user.is_staff:
        return redirect("monitor_dashboard")
    error = None
    
    # Generate simple captcha if not exists
    if 'captcha_code' not in request.session or request.method == 'GET':
        import random
        import string
        request.session['captcha_code'] = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
        
    if request.method == "POST":
        # Rate limiting logic
        ip = get_client_ip(request)
        key = f"login_attempt_{ip}"
        # Simple cache simulation using session (in production use Redis/Memcached)
        attempts = request.session.get(key, 0)
        
        if attempts >= 3:
            # Check cooldown
            last_attempt_time = request.session.get(f"{key}_time", 0)
            if timezone.now().timestamp() - last_attempt_time < 300: # 5 minutes cooldown
                error = "Terlalu banyak percobaan gagal. Silakan coba lagi dalam 5 menit."
                return render(request, "api/admin_login.html", {"error": error, "captcha_code": request.session['captcha_code']})
            else:
                # Reset attempts after cooldown
                attempts = 0
                request.session[key] = 0

        # Verify Captcha
        captcha_input = request.data.get("captcha")
        captcha_session = request.session.get('captcha_code')
        
        # Regenerate captcha for next attempt immediately to prevent replay
        import random
        import string
        new_captcha = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
        request.session['captcha_code'] = new_captcha

        if not captcha_input or captcha_input.upper() != captcha_session:
             request.session[key] = attempts + 1
             request.session[f"{key}_time"] = timezone.now().timestamp()
             error = "Kode keamanan (CAPTCHA) salah."
             return render(request, "api/admin_login.html", {"error": error, "captcha_code": new_captcha})

        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        if user and user.is_staff:
            # Clear failed attempts on success
            if key in request.session:
                del request.session[key]
            
            # Check for 2FA
            device = user.totpdevice_set.filter(confirmed=True).first()
            if device:
                # Store user ID in session for 2FA verification step
                request.session['pre_2fa_user_id'] = user.id
                return redirect('admin_2fa_verify')
            
            login(request, user)
            return redirect("monitor_dashboard")
        else:
            # Increment failed attempts
            request.session[key] = attempts + 1
            request.session[f"{key}_time"] = timezone.now().timestamp()
            error = "Username atau password salah."
            
    return render(request, "api/admin_login.html", {"error": error, "captcha_code": request.session.get('captcha_code')})

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def admin_2fa_verify_view(request):
    user_id = request.session.get('pre_2fa_user_id')
    if not user_id:
        return redirect('admin_login')
    
    error = None
    if request.method == 'POST':
        token = request.data.get('token')
        user = User.objects.get(id=user_id)
        device = user.totpdevice_set.filter(confirmed=True).first()
        
        if device and device.verify_token(token):
            login(request, user)
            del request.session['pre_2fa_user_id']
            return redirect('monitor_dashboard')
        else:
            error = "Kode 2FA salah."
            
    return render(request, "api/admin_2fa.html", {"error": error})

@login_required(login_url="/api/admin/login/")
def admin_logout_view(request):
    logout(request)
    return redirect("admin_login")

@login_required(login_url="/api/admin/login/")
def admin_profile_view(request):
    success = None
    error = None
    user = request.user
    
    # Get or create TOTP device
    device = user.totpdevice_set.first()
    qr_url = None
    
    if request.method == 'POST':
        action = request.POST.get('action')
        
        if action == 'update_profile':
            username = request.POST.get('username')
            if username and username != user.username:
                if User.objects.filter(username=username).exists():
                    error = "Username sudah digunakan."
                else:
                    user.username = username
                    user.save()
                    success = "Profil berhasil diperbarui."
            
            password = request.POST.get('password')
            if password:
                user.set_password(password)
                user.save()
                login(request, user) # Keep user logged in
                success = "Password berhasil diperbarui."

        elif action == 'setup_2fa':
            if not device:
                from django_otp.plugins.otp_totp.models import TOTPDevice
                device = TOTPDevice.objects.create(user=user, name="default", confirmed=False)
            
            import qrcode
            import io
            import base64
            
            # Generate QR Code
            uri = device.config_url
            img = qrcode.make(uri)
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            qr_url = f"data:image/png;base64,{base64.b64encode(buffer.getvalue()).decode()}"
            
        elif action == 'verify_2fa':
            token = request.POST.get('token')
            if device and device.verify_token(token):
                device.confirmed = True
                device.save()
                success = "2FA berhasil diaktifkan."
            else:
                error = "Kode token salah."
                
        elif action == 'disable_2fa':
            if device:
                device.delete()
                device = None
                success = "2FA berhasil dinonaktifkan."

    return render(request, "api/admin_profile.html", {
        "user": user, 
        "success": success, 
        "error": error,
        "device": device,
        "qr_url": qr_url
    })

from django.contrib import messages

@login_required(login_url="/api/admin/login/")
def admin_users_list_view(request):
    if not request.user.is_superuser:
        messages.error(request, "Anda tidak memiliki akses ke halaman ini.")
        return redirect("monitor_dashboard")
        
    admins = User.objects.filter(is_staff=True).order_by('-date_joined')
    super_admins_count = admins.filter(is_superuser=True).count()
    regular_admins_count = admins.filter(is_superuser=False).count()
    
    return render(request, "api/admin_users.html", {
        "admins": admins,
        "super_admins_count": super_admins_count,
        "regular_admins_count": regular_admins_count
    })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def dashboard_stats_view(request):
    """
    Returns aggregated stats for the admin dashboard.
    """
    try:
        # Get counts
        total_projects = Project.objects.count()
        total_messages = Message.objects.count()
        total_subscribers = Subscriber.objects.count()
        total_posts = BlogPost.objects.count()
        
        # Calculate changes (mock for now or compare with last month if needed)
        # For simplicity, we'll return 0 change or calculate based on created_at
        last_month = timezone.now() - timezone.timedelta(days=30)
        
        projects_new = Project.objects.filter(createdAt__gte=last_month).count()
        messages_new = Message.objects.filter(createdAt__gte=last_month).count()
        subscribers_new = Subscriber.objects.filter(subscribedAt__gte=last_month).count()
        
        # Mock Visitor Data (since we don't have a dedicated Analytics model yet)
        # Ideally, we would fetch this from Google Analytics or a custom tracker
        # We will generate "realistic" data based on log entries if possible, or return a structure
        
        # Use log files to estimate visitors? Too slow.
        # Return static structure for charts, but with real counts
        
        stats = {
            "totalViews": 12500, # Placeholder or sum of project views if we had it
            "viewsChange": 12,
            "totalMessages": total_messages,
            "messagesChange": messages_new,
            "totalProjects": total_projects,
            "projectsChange": projects_new,
            "totalSubscribers": total_subscribers,
            "subscribersChange": subscribers_new,
            "weeklyVisitors": [
                { "day": 'Mon', "visitors": 1200, "pageViews": 1800 },
                { "day": 'Tue', "visitors": 980, "pageViews": 1500 },
                { "day": 'Wed', "visitors": 1500, "pageViews": 2200 },
                { "day": 'Thu', "visitors": 1100, "pageViews": 1700 },
                { "day": 'Fri', "visitors": 1600, "pageViews": 2400 },
                { "day": 'Sat', "visitors": 900, "pageViews": 1300 },
                { "day": 'Sun', "visitors": 800, "pageViews": 1200 },
            ],
            "monthlyVisitors": [
                { "month": 'Jan', "visitors": 8500, "pageViews": 12000 },
                { "month": 'Feb', "visitors": 7800, "pageViews": 11000 },
                { "month": 'Mar', "visitors": 9200, "pageViews": 13500 },
                { "month": 'Apr', "visitors": 8800, "pageViews": 12800 },
                { "month": 'May', "visitors": 10000, "pageViews": 15000 },
                { "month": 'Jun', "visitors": 9500, "pageViews": 14200 },
            ],
            "deviceStats": [
                { "name": 'Desktop', "value": 62, "color": '#6366F1' },
                { "name": 'Mobile', "value": 28, "color": '#22C55E' },
                { "name": 'Tablet', "value": 10, "color": '#F59E0B' },
            ],
        }
        return Response(stats)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@login_required(login_url="/api/admin/login/")
def admin_create_view(request):
    if not request.user.is_superuser:
        return redirect("monitor_dashboard")
        
    if request.method == "POST":
        username = request.POST.get("username")
        email = request.POST.get("email")
        password = request.POST.get("password")
        role = request.POST.get("role")
        
        if User.objects.filter(username=username).exists():
            messages.error(request, "Username sudah digunakan.")
        else:
            is_superuser = (role == 'superuser')
            User.objects.create_user(
                username=username, 
                email=email, 
                password=password, 
                is_staff=True, 
                is_superuser=is_superuser
            )
            messages.success(request, "Admin berhasil ditambahkan.")
            
    return redirect("admin_users_list")

@login_required(login_url="/api/admin/login/")
def admin_toggle_status_view(request, user_id):
    if not request.user.is_superuser:
        return redirect("monitor_dashboard")
        
    if request.method == "POST":
        user = User.objects.get(id=user_id)
        if user.id != request.user.id: # Prevent self-lockout
            user.is_active = not user.is_active
            user.save()
            status = "diaktifkan" if user.is_active else "dinonaktifkan"
            messages.success(request, f"Admin {user.username} berhasil {status}.")
            
    return redirect("admin_users_list")

@login_required(login_url="/api/admin/login/")
def admin_delete_view(request):
    if not request.user.is_superuser:
        return redirect("monitor_dashboard")
        
    if request.method == "POST":
        user_id = request.POST.get("user_id")
        user = User.objects.get(id=user_id)
        if user.id != request.user.id:
            user.delete()
            messages.success(request, f"Admin {user.username} berhasil dihapus.")
            
    return redirect("admin_users_list")

@login_required(login_url="/api/admin/login/")
def admin_reset_password_view(request):
    if not request.user.is_superuser:
        return redirect("monitor_dashboard")
        
    if request.method == "POST":
        user_id = request.POST.get("user_id")
        new_password = request.POST.get("new_password")
        user = User.objects.get(id=user_id)
        user.set_password(new_password)
        user.save()
        messages.success(request, f"Password untuk {user.username} berhasil direset.")
            
    return redirect("admin_users_list")

@login_required(login_url="/api/admin/login/")
def monitor_dashboard_view(request):
    if not request.user.is_staff:
        return Response({"detail": "Forbidden"}, status=403)
    params = request.GET
    date_str = params.get("date")
    if not date_str:
        dates = get_available_log_dates()
        if dates:
            date_str = dates[0]
        else:
            date_str = timezone.now().date().isoformat()
    entries = read_log_file(date_str)
    entries = filter_logs(entries, params)
    success_count = 0
    error_count = 0
    for entry in entries:
        try:
            code = int(entry.get("status_code", 0))
        except Exception:
            continue
        if code < 400:
            success_count += 1
        else:
            error_count += 1
    try:
        page = int(params.get("page", "1"))
    except Exception:
        page = 1
    page_size = 20
    page_items, total, total_pages = paginate_list(entries, page, page_size)
    stats_per_hour = build_stats(entries)
    block_entries = BlockEntry.objects.filter(is_active=True).order_by("-created_at")
    context = {
        "date": date_str,
        "available_dates": get_available_log_dates(),
        "logs": page_items,
        "total": total,
        "success_count": success_count,
        "error_count": error_count,
        "page": page,
        "total_pages": total_pages,
        "stats_per_hour": stats_per_hour,
        "block_entries": block_entries,
        "params": params,
    }
    return render(request, "api/monitor_dashboard.html", context)


@login_required(login_url="/api/admin/login/")
def export_logs_view(request):
    if not request.user.is_staff:
        return Response({"detail": "Forbidden"}, status=403)
    date_str = request.GET.get("date") or timezone.now().date().isoformat()
    entries = read_log_file(date_str)
    file_name = f"logs_{date_str}.json"
    data = "\n".join(json.dumps(entry, ensure_ascii=False) for entry in entries)
    response = Response(data, content_type="application/json")
    response["Content-Disposition"] = f'attachment; filename="{file_name}"'
    return response


@api_view(['POST'])
@permission_classes([IsAdminUser])
def upload_media_view(request):
    if 'file' not in request.FILES:
        return Response({'error': 'No file provided'}, status=400)
    
    file = request.FILES['file']
    # Use default storage to save file
    file_name = default_storage.save(f'uploads/{file.name}', ContentFile(file.read()))
    
    # Generate full URL
    relative_url = default_storage.url(file_name)
    full_url = request.build_absolute_uri(relative_url)
    
    return Response({'url': full_url})


class AIKeyViewSet(viewsets.ModelViewSet):
    queryset = AIKey.objects.all().order_by("-created_at")
    serializer_class = AIKeySerializer
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['get'])
    def active_keys(self, request):
        # Return all active keys so frontend can perform failover
        # Group by provider
        provider = request.query_params.get('provider')
        qs = self.get_queryset().filter(is_active=True)
        
        if provider:
            qs = qs.filter(provider=provider)
            
        data = self.get_serializer(qs, many=True).data
        return Response(data)

    @action(detail=False, methods=['post'])
    def bulk_import(self, request):
        try:
            data = request.data
            keys = data.get('keys', [])
            if not isinstance(keys, list):
                return Response({'error': 'Expected a list of keys'}, status=400)
            
            created_count = 0
            for item in keys:
                provider = item.get('provider')
                key = item.get('key')
                if provider and key:
                    # Avoid duplicates
                    if not AIKey.objects.filter(key=key).exists():
                        AIKey.objects.create(provider=provider, key=key, is_active=True)
                        created_count += 1
            
            return Response({'created': created_count})
        except Exception as e:
            return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_media_view(request):
    media_root = settings.MEDIA_ROOT
    files_list = []
    
    if not os.path.exists(media_root):
         return Response([])

    # Walk through the media directory
    for root, dirs, files in os.walk(media_root):
        for file in files:
            # Get relative path from MEDIA_ROOT
            full_path = os.path.join(root, file)
            relative_path = os.path.relpath(full_path, media_root)
            
            # Convert Windows path separators to forward slashes for URL
            url_path = relative_path.replace('\\', '/')
            
            # Construct URL - ensure MEDIA_URL is used correctly
            # settings.MEDIA_URL usually is '/media/'
            media_url = settings.MEDIA_URL.rstrip('/')
            url = f"{media_url}/{url_path}"
            full_url = request.build_absolute_uri(url)
            
            # Get file stats
            try:
                stats = os.stat(full_path)
                size = stats.st_size
                modified = stats.st_mtime
            except:
                size = 0
                modified = 0
            
            files_list.append({
                'name': file,
                'path': relative_path,
                'url': full_url,
                'size': size,
                'modified': modified,
                'type': 'image' if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg')) else 'file'
            })
            
    # Sort by modified date desc
    files_list.sort(key=lambda x: x['modified'], reverse=True)
    
    return Response(files_list)

