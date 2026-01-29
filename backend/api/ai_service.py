import google.generativeai as genai
from groq import Groq
from django.utils import timezone
from .models import AIKey, SiteSettings
from .crypto_utils import decrypt_value
import logging
import json
import re

logger = logging.getLogger(__name__)

class AIService:
    @staticmethod
    def get_system_prompt(base_instruction=""):
        current_date = timezone.now().strftime("%Y-%m-%d")
        current_year = timezone.now().year
        
        prompt = f"""
        System Context:
        - Application: Personal Portfolio Website Manager
        - Current Date: {current_date} (Year: {current_year})
        - Language: Indonesian (Bahasa Indonesia)
        
        Formatting Rules:
        - For headings, use HTML <h2>, <h3> tags.
        - For bold text, use HTML <b> or <strong> tags. DO NOT use markdown **bold**.
        - For lists, use HTML <ul><li>...</li></ul> or <ol><li>...</li></ol>.
        - For code blocks, use HTML <pre><code>...</code></pre>.
        - For paragraphs, use <p>...</p>.
        - Ensure the output is valid HTML suitable for a rich text editor.
        
        {base_instruction}
        """
        return prompt.strip()

    @staticmethod
    def get_active_provider():
        try:
            settings = SiteSettings.objects.first()
            if settings:
                return settings.ai_provider
        except:
            pass
        return 'gemini' # Default

    @staticmethod
    def generate_content_generic(prompt, system_instruction=None, json_mode=False):
        provider = AIService.get_active_provider()
        
        # Enhance system instruction with global defaults
        full_system_instruction = AIService.get_system_prompt(system_instruction or "You are a helpful assistant.")
        
        try:
            if provider == 'gemini':
                return AIService.call_gemini(prompt, system_instruction=full_system_instruction)
            elif provider == 'groq':
                messages = [
                    {"role": "system", "content": full_system_instruction},
                    {"role": "user", "content": prompt}
                ]
                return AIService.call_groq(messages)
            else:
                raise Exception(f"Unknown provider: {provider}")
        except Exception as e:
            logger.error(f"Generation failed with {provider}: {e}")
            raise e

    @staticmethod
    def get_active_keys(provider):
        # Get active keys ordered by error_count (prefer low errors) and then last_used (rotate)
        keys = AIKey.objects.filter(provider=provider, is_active=True).order_by('error_count', 'last_used')
        if not keys.exists():
            return []
        return keys

    @staticmethod
    def call_gemini(prompt, system_instruction=None):
        keys = AIService.get_active_keys('gemini')
        if not keys:
             raise Exception("No active Gemini keys found.")

        last_exception = None

        for key_obj in keys:
            try:
                api_key = decrypt_value(key_obj.key)
                genai.configure(api_key=api_key)
                
                # Use gemini-2.5-flash as requested (2026 update)
                model_name = 'gemini-2.5-flash' 
                
                generation_config = genai.types.GenerationConfig(
                    candidate_count=1,
                    max_output_tokens=2048,
                    temperature=0.7,
                )
                
                model = genai.GenerativeModel(model_name)
                
                final_prompt = prompt
                if system_instruction:
                    final_prompt = f"System Instruction: {system_instruction}\n\nTask: {prompt}"

                response = model.generate_content(final_prompt, generation_config=generation_config)
                
                if not response.text:
                    raise Exception("Empty response from Gemini")

                # Update usage
                key_obj.last_used = timezone.now()
                key_obj.save()
                
                return response.text
            except Exception as e:
                logger.error(f"Gemini error with key ID {key_obj.id}: {str(e)}")
                key_obj.error_count += 1
                key_obj.save()
                last_exception = e
                continue
        
        raise last_exception or Exception("All Gemini keys failed")

    @staticmethod
    def call_groq(messages):
        keys = AIService.get_active_keys('groq')
        if not keys:
             raise Exception("No active Groq keys found.")

        last_exception = None

        for key_obj in keys:
            try:
                api_key = decrypt_value(key_obj.key)
                client = Groq(api_key=api_key)
                
                completion = client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=messages,
                    temperature=0.7,
                    max_tokens=2048,
                    top_p=1,
                    stream=False,
                    stop=None,
                )
                
                content = completion.choices[0].message.content
                if not content:
                    raise Exception("Empty response from Groq")

                # Update usage
                key_obj.last_used = timezone.now()
                key_obj.save()
                
                return content
            except Exception as e:
                logger.error(f"Groq error with key ID {key_obj.id}: {str(e)}")
                key_obj.error_count += 1
                key_obj.save()
                last_exception = e
                continue
                
        raise last_exception or Exception("All Groq keys failed")

    # --- Feature Implementations ---

    @staticmethod
    def writing_assistant(topic, tone="professional", type="blog"):
        """
        AI Writing Assistant: Helps write/edit content.
        """
        if type == "excerpt":
            prompt = f"Write a {tone} short excerpt (summary) about: {topic}. \n\nKeep it under 300 characters. No headings, just plain text. Do not use HTML tags like <p>."
        elif type == "project_description":
            prompt = f"Write a {tone} project description for a project named/about: {topic}. \n\nHighlight key features and tech stack if mentioned. Keep it concise (1-2 paragraphs). Output HTML <p> tags."
        elif type == "project_detail":
            # Context is usually passed in topic for this type
            prompt = f"""
            Task: Write a detailed project case study/article in {tone} tone.
            
            Project Context:
            {topic}
            
            Requirements:
            1. Create a compelling narrative about the project.
            2. Structure with clear HTML headings (<h2>).
            3. Include sections for: Overview, Key Features, Technical Challenges, and Solutions.
            4. If technologies are mentioned, explain how they were used.
            5. Include at least one code snippet example (mockup if necessary) using <pre><code>...</code></pre> tags to demonstrate a feature.
            6. Use <b>bold</b> for emphasis on key terms.
            7. Use compact spacing between paragraphs.
            """
        else:
            # Default blog post
            prompt = f"""
            Task: Write a {tone} blog article about: {topic}.
            
            Requirements:
            1. Create an engaging title (if not provided).
            2. Write a captivating introduction.
            3. Use clear HTML headings (<h2>, <h3>) to structure the content.
            4. Provide actionable insights or deep analysis.
            5. Use <b>bold</b> for key concepts.
            6. Include a conclusion.
            7. Output strictly HTML content (no markdown).
            8. Ensure paragraphs are concise and not too far apart.
            """
        
        return AIService.generate_content_generic(prompt, system_instruction="You are a professional content writer.")

    @staticmethod
    def smart_inbox_analysis(message_text, sender_email=""):
        """
        Smart Inbox: Analyzes message for summary, sentiment, category.
        """
        prompt = f"""
        Analyze the following message from {sender_email}:
        "{message_text}"
        
        Return a valid JSON object with these keys:
        - "summary": (string) Brief summary max 2 sentences.
        - "sentiment": (string) "Positive", "Neutral", or "Negative".
        - "category": (string) "Inquiry", "Support", "Feedback", "Spam", "Collaboration", or "Other".
        - "suggested_reply": (string) A brief, polite reply draft.
        
        Ensure the output is pure JSON without Markdown formatting.
        """
        try:
            # Use generic generator but force JSON parsing
            response = AIService.generate_content_generic(prompt, system_instruction="You are an intelligent inbox assistant. You strictly output valid JSON.")
            
            # Clean up if markdown is present
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                response = response.split("```")[1].split("```")[0]
            return json.loads(response.strip())
        except Exception as e:
            logger.error(f"Smart Inbox JSON parse error: {e}")
            # Fallback simple structure
            return {
                "summary": "Error analyzing message.",
                "sentiment": "Neutral",
                "category": "Other",
                "suggested_reply": "Thank you for your message."
            }

    @staticmethod
    def global_copilot(query, context=""):
        """
        Global AI Copilot: Chatbot for admin tasks.
        """
        prompt = f"Context: {context}\n\nQuestion: {query}"
        return AIService.generate_content_generic(prompt, system_instruction="You are the Global AI Copilot for the Portfolio Admin Panel. You assist the administrator with tasks, insights, and data management. Be concise and helpful.")

    @staticmethod
    def seo_optimizer(content, target_keyword=""):
        """
        SEO Optimizer: Analyzes content for SEO.
        """
        prompt = f"""
        Analyze the following content for SEO optimization targeting the keyword: "{target_keyword}" (if empty, identify the main topic).
        
        Content:
        "{content[:3000]}..."
        
        Provide a JSON response with:
        - "score": (number) 0-100
        - "keywords": (list of strings) 5-8 highly relevant, search-optimized keywords (LSI keywords) related to the topic.
        - "suggestions": (list of strings) Improvements for readability and SEO
        - "meta_title": (string) Recommended meta title (max 60 chars)
        - "meta_description": (string) Recommended meta description (max 160 chars, plain text only, no HTML tags)
        
        Constraint:
        - Ensure "meta_description" is PURE TEXT. Do not include <p>, <div>, or any HTML tags.
        - Ensure "keywords" are comma-separated strings if returning a list.
        - Ensure output is valid JSON.
        """
        try:
            response = AIService.generate_content_generic(prompt, system_instruction="You are an SEO Expert. Output strict JSON.")
            
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                response = response.split("```")[1].split("```")[0]
            
            result = json.loads(response.strip())
            
            # Map keys to frontend expectations if necessary
            if 'meta_title' in result and 'title' not in result:
                result['title'] = result['meta_title']
            if 'meta_description' in result and 'description' not in result:
                # Double check to remove any HTML tags if AI slipped up
                clean_desc = re.sub(r'<[^>]+>', '', result['meta_description'])
                result['description'] = clean_desc
                
            return result
        except Exception as e:
            logger.error(f"SEO Optimizer error: {e}")
            return {
                "score": 0,
                "error": "Could not analyze SEO",
                "suggestions": [str(e)]
            }
