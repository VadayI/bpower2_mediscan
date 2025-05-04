import base64
from io import BytesIO
import openai
from django.conf import settings
from ..models import AppSetting, OpenAIRequest

def perform_ocr(file=None, base64_str=None, user=None):
    """
    Konwertuje plik PDF/obraz na Base64, wysyła do API OpenAI 'responses' i zwraca tekst JSON.
    Zapisuje statystyki zapytania w OpenAIRequest.
    """
    # 1. Pobierz konfigurację (z AppSettings lub .env)
    def get_setting(key, default=None):
        try:
            return AppSetting.objects.get(key=key).value
        except AppSetting.DoesNotExist:
            return default

    prompt_system = get_setting('prompt_system', None) or settings.PROMPT_SYSTEM
    default_model  = get_setting('default_model',  None) or settings.DEFAULT_MODEL
    api_key        = get_setting('openai_api_key', None) or settings.OPENAI_API_KEY
    openai.api_key = api_key

    # 2. Wczytaj zawartość pliku lub dekoduj Base64
    if base64_str:
        raw_bytes = base64.b64decode(base64_str)
    else:
        raw_bytes = file.read()

    # 3. Konwersja do Base64 (wymagane)
    content_b64 = base64.b64encode(raw_bytes).decode('utf-8')

    # 4. Przygotuj plik dla OpenAI (odkodowane bajty)
    file_bytes = base64.b64decode(content_b64)
    file_obj   = BytesIO(file_bytes)
    filename   = getattr(file, 'name', 'document')
    file_type  = 'pdf' if filename.lower().endswith('.pdf') else 'png'

    # 5. Prześlij plik do OpenAI w trybie 'responses'
    upload_resp = openai.File.create(
        file=file_obj,
        filetype=file_type,
        purpose='responses'
    )

    # 6. Wywołaj endpoint responses, aby otrzymać wyekstrahowany JSON
    response = openai.responses.generate(
        model=default_model,
        file=upload_resp.id,
        prompt=prompt_system
    )

    # 7. Odczytaj wynik i użycie tokenów
    result = response['choices'][0]['text']
    usage  = response.get('usage', {})

    # 8. Zapisz historię w bazie
    OpenAIRequest.objects.create(
        user=user,
        model=response.get('model', default_model),
        prompt_tokens=usage.get('prompt_tokens', 0),
        completion_tokens=usage.get('completion_tokens', 0),
        total_tokens=usage.get('total_tokens', 0)
    )

    return result