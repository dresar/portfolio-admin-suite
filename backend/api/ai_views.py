from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from .ai_service import AIService
from .models import AIKey
from .crypto_utils import encrypt_value, decrypt_value
import csv
import json
import io

@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_ai_keys(request):
    keys = AIKey.objects.all().order_by('-created_at')
    data = []
    for key in keys:
        decrypted_key = decrypt_value(key.key)
        masked_key = f"{decrypted_key[:8]}...{decrypted_key[-4:]}" if len(decrypted_key) > 12 else "****"
        data.append({
            "id": key.id,
            "provider": key.provider,
            "masked_key": masked_key,
            "is_active": key.is_active,
            "created_at": key.created_at,
            "last_used": key.last_used,
            "error_count": key.error_count
        })
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def add_ai_key(request):
    provider = request.data.get('provider')
    key = request.data.get('key')
    
    if not provider or not key:
        return Response({"error": "Provider and Key are required"}, status=400)
        
    if provider.lower() not in ['gemini', 'groq']:
        return Response({"error": "Invalid provider. Must be 'gemini' or 'groq'"}, status=400)
        
    try:
        AIKey.objects.create(
            provider=provider.lower(),
            key=encrypt_value(key),
            is_active=True
        )
        return Response({"message": "Key added successfully", "success": True})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def test_ai_key(request, key_id):
    try:
        key_obj = AIKey.objects.get(id=key_id)
        api_key = decrypt_value(key_obj.key)
        
        success = False
        message = ""
        
        if key_obj.provider == 'gemini':
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                # Use gemini-2.5-flash as the primary model (2026 standard)
                try:
                    model = genai.GenerativeModel('gemini-2.5-flash')
                    response = model.generate_content("Test connection. Reply with 'OK'.")
                except Exception:
                    # Fallback only to stable versions if 2.5 fails
                    try:
                        # Attempt with pro version if flash fails
                        model = genai.GenerativeModel('gemini-2.5-pro') 
                        response = model.generate_content("Test connection. Reply with 'OK'.")
                    except:
                         # Last resort, but try to stick to 2.5 series
                        model = genai.GenerativeModel('gemini-2.0-flash')
                        response = model.generate_content("Test connection. Reply with 'OK'.")
                        
                if response.text:
                    success = True
                    message = "Connection successful!"
            except Exception as e:
                error_msg = str(e)
                if "429" in error_msg or "Quota exceeded" in error_msg:
                    message = "Quota Exceeded (Limit Reached)"
                else:
                    message = f"Gemini Error: {error_msg}"

                
        elif key_obj.provider == 'groq':
            try:
                from groq import Groq
                client = Groq(api_key=api_key)
                completion = client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[{"role": "user", "content": "Test connection. Reply with 'OK'."}],
                    max_tokens=10
                )
                if completion.choices[0].message.content:
                    success = True
                    message = "Connection successful!"
            except Exception as e:
                error_msg = str(e)
                if "429" in error_msg or "rate limit" in error_msg.lower():
                    message = "Rate Limit Exceeded"
                else:
                    message = f"Groq Error: {error_msg}"
        
        return Response({"success": success, "message": message})
        
    except AIKey.DoesNotExist:
        return Response({"error": "Key not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_ai_key(request, key_id):
    try:
        key = AIKey.objects.get(id=key_id)
        key.delete()
        return Response({"message": "Key deleted successfully"})
    except AIKey.DoesNotExist:
        return Response({"error": "Key not found"}, status=404)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def ai_write(request):
    topic = request.data.get('topic')
    tone = request.data.get('tone', 'professional')
    type_ = request.data.get('type', 'blog')
    
    if not topic:
        return Response({"error": "Topic is required"}, status=400)
        
    try:
        content = AIService.writing_assistant(topic, tone, type_)
        return Response({"content": content})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def ai_analyze_message(request):
    message = request.data.get('message')
    sender = request.data.get('sender', '')
    
    if not message:
        return Response({"error": "Message is required"}, status=400)
        
    try:
        analysis = AIService.smart_inbox_analysis(message, sender)
        return Response(analysis)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def ai_chat(request):
    query = request.data.get('query')
    context = request.data.get('context', '')
    
    if not query:
        return Response({"error": "Query is required"}, status=400)
        
    try:
        response = AIService.global_copilot(query, context)
        return Response({"response": response})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def ai_seo(request):
    content = request.data.get('content')
    keyword = request.data.get('keyword', '')
    
    if not content:
        return Response({"error": "Content is required"}, status=400)
        
    try:
        analysis = AIService.seo_optimizer(content, keyword)
        return Response(analysis)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAdminUser])
@parser_classes([MultiPartParser])
def upload_ai_keys(request):
    file_obj = request.FILES.get('file')
    if not file_obj:
        return Response({"error": "No file uploaded"}, status=400)
    
    try:
        decoded_file = file_obj.read().decode('utf-8')
        io_string = io.StringIO(decoded_file)
        count = 0
        
        # Check if it's JSON
        try:
            data = json.loads(decoded_file)
            if isinstance(data, list):
                for item in data:
                    if 'provider' in item and 'key' in item:
                        AIKey.objects.create(
                            provider=item['provider'].lower(),
                            key=encrypt_value(item['key']),
                            is_active=True
                        )
                        count += 1
                return Response({"message": f"Successfully imported {count} keys from JSON."})
        except json.JSONDecodeError:
            pass
            
        # Try CSV
        reader = csv.reader(io_string)
        header = next(reader, None)
        
        if header:
            # Normalize header to lowercase and strip whitespace
            header = [h.strip().lower() for h in header]
            
            # Find indices for 'gemini' and 'groq' columns
            gemini_idx = -1
            groq_idx = -1
            
            if 'gemini' in header:
                gemini_idx = header.index('gemini')
            if 'groq' in header:
                groq_idx = header.index('groq')
            
            # Also support legacy 'provider' and 'key' format if present
            provider_idx = -1
            key_idx = -1
            if 'provider' in header:
                provider_idx = header.index('provider')
            if 'key' in header:
                key_idx = header.index('key')

            for row in reader:
                # Handle new format: columns 'gemini' and 'groq'
                if gemini_idx != -1 and len(row) > gemini_idx and row[gemini_idx].strip():
                    AIKey.objects.create(
                        provider='gemini',
                        key=encrypt_value(row[gemini_idx].strip()),
                        is_active=True
                    )
                    count += 1
                
                if groq_idx != -1 and len(row) > groq_idx and row[groq_idx].strip():
                    AIKey.objects.create(
                        provider='groq',
                        key=encrypt_value(row[groq_idx].strip()),
                        is_active=True
                    )
                    count += 1
                
                # Handle legacy format
                if provider_idx != -1 and key_idx != -1 and len(row) > max(provider_idx, key_idx):
                    provider = row[provider_idx].strip().lower()
                    key = row[key_idx].strip()
                    if provider and key:
                        AIKey.objects.create(
                            provider=provider,
                            key=encrypt_value(key),
                            is_active=True
                        )
                        count += 1

        return Response({"message": f"Successfully imported {count} keys from CSV."})
            
    except Exception as e:
        return Response({"error": str(e)}, status=500)
