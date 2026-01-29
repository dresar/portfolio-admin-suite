from django.contrib import admin
from django import forms
from django.urls import path
from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import HttpResponse
from django.utils.html import format_html
from .models import AIKey, SiteSettings
from .crypto_utils import encrypt_value, decrypt_value
import csv
import json
import io

class AIKeyForm(forms.ModelForm):
    key = forms.CharField(widget=forms.PasswordInput(render_value=True), help_text="Enter the API Key. It will be encrypted on save.")

    class Meta:
        model = AIKey
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk and self.instance.key:
            try:
                self.initial['key'] = decrypt_value(self.instance.key)
            except:
                pass

    def save(self, commit=True):
        instance = super().save(commit=False)
        # Always encrypt the key from the form
        instance.key = encrypt_value(self.cleaned_data['key'])
        if commit:
            instance.save()
        return instance

@admin.register(AIKey)
class AIKeyAdmin(admin.ModelAdmin):
    form = AIKeyForm
    list_display = ('provider', 'get_masked_key', 'is_active', 'error_count', 'last_used', 'created_at')
    list_filter = ('provider', 'is_active')
    readonly_fields = ('last_used', 'error_count')
    change_list_template = "admin/api/aikey/change_list.html"  # We'll create this to add the button
    actions = ['export_as_json', 'reset_error_counts']
    
    def get_masked_key(self, obj):
        try:
            decrypted = decrypt_value(obj.key)
            if len(decrypted) > 8:
                return f"{decrypted[:4]}...{decrypted[-4:]}"
            return "******"
        except:
            return "Error Decrypting"
    get_masked_key.short_description = 'Key'

    def get_urls(self):
        urls = super().get_urls()
        my_urls = [
            path('import-keys/', self.admin_site.admin_view(self.import_keys), name='api_aikey_import'),
        ]
        return my_urls + urls

    def import_keys(self, request):
        if request.method == "POST":
            csv_file = request.FILES.get("file")
            if not csv_file:
                messages.error(request, "No file uploaded")
                return redirect("..")
            
            try:
                decoded_file = csv_file.read().decode('utf-8')
                io_string = io.StringIO(decoded_file)
                
                # Check if it's JSON
                try:
                    # Try parsing as JSON first
                    data = json.loads(decoded_file)
                    if isinstance(data, list):
                        count = 0
                        for item in data:
                            if 'provider' in item and 'key' in item:
                                AIKey.objects.create(
                                    provider=item['provider'].lower(),
                                    key=encrypt_value(item['key']),
                                    is_active=True
                                )
                                count += 1
                        messages.success(request, f"Successfully imported {count} keys from JSON.")
                        return redirect("..")
                except json.JSONDecodeError:
                    # Not JSON, try CSV
                    pass

                # Parse as CSV
                reader = csv.reader(io_string, delimiter=',')
                count = 0
                for row in reader:
                    if len(row) >= 2:
                        provider = row[0].strip().lower()
                        key = row[1].strip()
                        if provider in ['gemini', 'groq'] and key:
                            AIKey.objects.create(
                                provider=provider,
                                key=encrypt_value(key),
                                is_active=True
                            )
                            count += 1
                messages.success(request, f"Successfully imported {count} keys from CSV.")
                return redirect("..")
                
            except Exception as e:
                messages.error(request, f"Error importing file: {str(e)}")
                return redirect("..")
                
        return render(request, "admin/api/aikey/import_keys.html")

    def export_as_json(self, request, queryset):
        data = []
        for obj in queryset:
            try:
                decrypted_key = decrypt_value(obj.key)
            except:
                decrypted_key = "ERROR_DECRYPTING"
            
            data.append({
                "provider": obj.provider,
                "key": decrypted_key,
                "is_active": obj.is_active,
                "error_count": obj.error_count,
                "created_at": str(obj.created_at)
            })
        
        response = HttpResponse(json.dumps(data, indent=4), content_type="application/json")
        response['Content-Disposition'] = 'attachment; filename=ai_keys_export.json'
        return response
    
    export_as_json.short_description = "Export selected keys as JSON"

    def reset_error_counts(self, request, queryset):
        rows_updated = queryset.update(error_count=0)
        self.message_user(request, f"{rows_updated} keys have been reset.")
    reset_error_counts.short_description = "Reset error counts for selected keys"

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ('theme', 'maintenanceMode', 'maintenance_end_time')
    fieldsets = (
        ('General', {
            'fields': ('theme', 'seoTitle', 'seoDesc', 'cdn_url')
        }),
        ('Maintenance', {
            'fields': ('maintenanceMode', 'maintenance_end_time'),
            'description': 'Set maintenance mode and optional auto-expire time.'
        }),
    )
