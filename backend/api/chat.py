from ml_integration.chat_service import local_chat_service
import os

def get_chat_response_stream(user_query, diagnosis_context, lang='en'):
    """
    Generates a response using the local AI model, localized to 'lang', as a stream.
    """
    try:
        return local_chat_service.generate_response_stream(user_query, diagnosis_context, lang)
    except Exception as e:
        print(f"Local AI Error: {e}")
        def fallback():
            yield "Sorry, could not process your request locally at the moment."
        return fallback()
