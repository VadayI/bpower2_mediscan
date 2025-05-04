import base64
from io import BytesIO
from openai import OpenAI
from django.conf import settings
from ..models import AppSetting, OpenAIRequest

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

    # Przygotowanie pliku
    if base64_str:
        data_bytes = base64.b64decode(base64_str)
        filename = 'file'
    else:
        data_bytes = file.read()
        filename = getattr(file, 'name', 'file')

    # Kodowanie pliku w base64 i przygotowanie payload
    data_b64  = base64.b64encode(data_bytes).decode('utf-8')
    file_data = f"data:application/octet-stream;base64,{data_b64}"
    content   = [
        { 'type': 'input_file', 'filename': filename, 'file_data': file_data },
        { 'type': 'input_text', 'text': prompt_system }
    ]

    # Wywołanie Responses API
    response = client.responses.create(
        model=default_model,
        input=[{ 'role': 'user', 'content': content }]
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

