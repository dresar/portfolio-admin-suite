from django.test import TestCase
from unittest.mock import patch, MagicMock
from .models import AIKey
from .ai_service import AIService
from .crypto_utils import encrypt_value

class AIServiceTests(TestCase):
    def setUp(self):
        # Create keys
        self.key1 = AIKey.objects.create(
            provider='gemini',
            key=encrypt_value('fake_key_1'),
            is_active=True
        )
        self.key2 = AIKey.objects.create(
            provider='gemini',
            key=encrypt_value('fake_key_2'),
            is_active=True
        )

    @patch('api.ai_service.genai')
    def test_gemini_fallback(self, mock_genai):
        # Setup mock to fail on first key, succeed on second
        mock_model = MagicMock()
        mock_genai.GenerativeModel.return_value = mock_model
        
        # Define side effect for generate_content
        call_count = 0
        def side_effect(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                raise Exception("API Error")
            return MagicMock(text="Success")

        mock_model.generate_content.side_effect = side_effect
        
        # We also need to mock configure to avoid real calls or errors
        mock_genai.configure = MagicMock()
        
        response = AIService.call_gemini("test")
        
        self.assertEqual(response, "Success")
        self.key1.refresh_from_db()
        self.key2.refresh_from_db()
        
        # Key 1 should have error count 1 (incremented)
        self.assertEqual(self.key1.error_count, 1)
        # Key 2 should have error count 0 (unchanged)
        self.assertEqual(self.key2.error_count, 0)

    @patch('api.ai_service.Groq')
    def test_groq_call(self, mock_groq_class):
        # Setup Groq mock
        mock_client = MagicMock()
        mock_groq_class.return_value = mock_client
        
        mock_completion = MagicMock()
        mock_completion.choices = [MagicMock(message=MagicMock(content='{"summary": "test"}'))]
        mock_client.chat.completions.create.return_value = mock_completion
        
        # Create Groq key
        AIKey.objects.create(provider='groq', key=encrypt_value('g_key'), is_active=True)
        
        result = AIService.smart_inbox_analysis("test message")
        self.assertEqual(result['summary'], "test")
