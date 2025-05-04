import base64
from io import BytesIO
from openai import OpenAI
from django.conf import settings
from ..models import AppSetting, OpenAIRequest
import mimetypes

def perform_ocr(file=None, base64_str=None, user=None):
    # Pomocnicza funkcja do pobrania ustawień
    def get_setting(key, default=None):
        try:
            return AppSetting.objects.get(key=key).value
        except AppSetting.DoesNotExist:
            return default

    prompt_system = get_setting('prompt_system', 'Ekstrakcja danych z wyników badań.')
    default_model = get_setting('default_model', 'gpt-4o')
    api_key       = get_setting('openai_api_key')

    # Inicjalizacja klienta OpenAI
    client = OpenAI(api_key=api_key)

    # Przygotowanie zawartości pliku i nazwy
    if base64_str:
        data_bytes = base64.b64decode(base64_str)
        filename   = 'file'
    else:
        data_bytes = file.read()
        filename   = getattr(file, 'name', 'file')

    # Zakoduj do base64
    data_b64 = base64.b64encode(data_bytes).decode('utf-8')

    # Dobierz poprawny MIME type
    mime_type, _ = mimetypes.guess_type(filename)
    if not mime_type:
        # jeśli nie udało się odczytać rozszerzenia, wymuś PDF jako domyślne
        mime_type = 'application/pdf' if filename.lower().endswith('.pdf') else 'application/octet-stream'

    file_data = f"data:{mime_type};base64,{data_b64}"

    # Wywołanie Responses API
    response = client.responses.create(
        model=default_model,
        input=[
            {
                'role': 'developer', 
                'content': {
                    "type": "input_text",
                    "text": prompt_system
                } 
            },
            {
                'role': 'user', 
                'content': {
                    'type': 'input_file', 
                    'filename': filename, 
                    'file_data': file_data 
                } 
            },
        ],
        text={
            "format": {
                "type": "json_object"
            }
        },
        reasoning={
            "effort": "medium"
        },
        tools=[],
        store=False,
        max_output_tokens=16384
    )

    # Odczyt wyniku i statystyk (jeśli dostępne)
    result = getattr(response, 'output_text', '')
    usage  = getattr(response, 'usage', None)

    # Zapis historii zapytania
    OpenAIRequest.objects.create(
        user              = user,
        model             = default_model,
        prompt_tokens     = getattr(usage, 'prompt_tokens', 0) if usage else 0,
        completion_tokens = getattr(usage, 'completion_tokens', 0) if usage else 0,
        total_tokens      = getattr(usage, 'total_tokens', 0) if usage else 0
    )

    return result

