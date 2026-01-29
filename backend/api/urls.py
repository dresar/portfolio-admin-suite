from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProfileViewSet, SocialLinkViewSet, SkillViewSet, 
    ExperienceViewSet, EducationViewSet, ProjectViewSet, 
    CertificateViewSet, MessageViewSet, SiteSettingsViewSet, HomeContentViewSet, AboutContentViewSet, ProjectCategoryViewSet, SubscriberViewSet, login_view, me_view, get_captcha_api_view, SkillCategoryViewSet, CertificateCategoryViewSet, WATemplateViewSet, BlockEntryViewSet, BlogCategoryViewSet, BlogPostViewSet, admin_login_view, admin_logout_view, monitor_dashboard_view, export_logs_view, upload_media_view,
    admin_2fa_verify_view, admin_profile_view, admin_users_list_view, admin_create_view, admin_toggle_status_view, admin_delete_view, admin_reset_password_view, AIKeyViewSet, dashboard_stats_view
)
from .views import list_media_view
# from .ai_views import ai_write, ai_analyze_message, ai_chat, ai_seo, upload_ai_keys, list_ai_keys, test_ai_key, delete_ai_key, add_ai_key

router = DefaultRouter()
# Note: Profile and SiteSettings are treated as singletons in viewset, but routed normally
router.register(r'profile', ProfileViewSet, basename='profile')
router.register(r'settings', SiteSettingsViewSet, basename='settings')
router.register(r'home-content', HomeContentViewSet, basename='home-content')
router.register(r'about-content', AboutContentViewSet, basename='about-content')
router.register(r'social-links', SocialLinkViewSet)
router.register(r'skills', SkillViewSet)
router.register(r'skill-categories', SkillCategoryViewSet)
router.register(r'experience', ExperienceViewSet)
router.register(r'education', EducationViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'project-categories', ProjectCategoryViewSet)
router.register(r'certificates', CertificateViewSet)
router.register(r'certificate-categories', CertificateCategoryViewSet)
router.register(r'wa-templates', WATemplateViewSet)
router.register(r'messages', MessageViewSet)
router.register(r'subscribers', SubscriberViewSet)
router.register(r'block-entries', BlockEntryViewSet, basename='block-entries')
router.register(r'blog-categories', BlogCategoryViewSet)
router.register(r'blog-posts', BlogPostViewSet)
router.register(r'ai-keys', AIKeyViewSet, basename='ai-keys')

urlpatterns = [
    path('auth/login/', login_view, name='login'),
    path('auth/captcha/', get_captcha_api_view, name='get_captcha'),
    path('auth/me/', me_view, name='me'),
    # Admin Auth
    path('admin/login/', admin_login_view, name='admin_login'),
    path('admin/2fa/', admin_2fa_verify_view, name='admin_2fa_verify'),
    path('admin/logout/', admin_logout_view, name='admin_logout'),
    path('admin/profile/', admin_profile_view, name='admin_profile'),

    # Admin Management
    path('admin/users/', admin_users_list_view, name='admin_users_list'),
    path('admin/users/create/', admin_create_view, name='admin_create'),
    path('admin/users/toggle/<int:user_id>/', admin_toggle_status_view, name='admin_toggle_status'),
    path('admin/users/delete/', admin_delete_view, name='admin_delete'),
    path('admin/users/reset-password/', admin_reset_password_view, name='admin_reset_password'),
    path('monitor/', monitor_dashboard_view, name='monitor_dashboard'),
    path('monitor/export/', export_logs_view, name='monitor_export'),
    path('dashboard/stats/', dashboard_stats_view, name='dashboard_stats'),
    path('upload/', upload_media_view, name='upload-media'),
    path('media/list/', list_media_view, name='list-media'),
    # AI Endpoints
    path('ai/keys/', list_ai_keys, name='ai-keys-list'),
    path('ai/keys/<int:key_id>/test/', test_ai_key, name='ai-keys-test'),
    path('ai/keys/add/', add_ai_key, name='ai-keys-add'),
    path('ai/keys/<int:key_id>/', delete_ai_key, name='ai-keys-delete'),
    path('ai/write/', ai_write, name='ai-write'),
    path('ai/analyze-message/', ai_analyze_message, name='ai-analyze-message'),
    path('ai/chat/', ai_chat, name='ai-chat'),
    path('ai/seo/', ai_seo, name='ai-seo'),
    path('ai/upload-keys/', upload_ai_keys, name='ai-upload-keys'),
    path('', include(router.urls)),
]
