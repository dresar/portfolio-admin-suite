from deep_translator import GoogleTranslator
import logging

logger = logging.getLogger(__name__)

def translate_text(text, target_lang='en', source_lang='id'):
    """
    Translates text from source_lang to target_lang using Deep Translator (Google Translate).
    Includes error handling and fallback mechanism.
    """
    if not text:
        return ""
        
    try:
        # Check if text is already in target language (basic check: skipped for now to ensure consistency)
        
        translator = GoogleTranslator(source=source_lang, target=target_lang)
        translated = translator.translate(text)
        
        return translated
    except Exception as e:
        logger.error(f"Translation failed for text '{text[:20]}...': {str(e)}")
        # Fallback: Return original text if translation fails
        return text
