import base64
from io import BytesIO
import openai
from django.conf import settings
from ..models import AppSetting, OpenAIRequest


def perform_ocr(file=None, base64_str=None, user=None):
    # Pomocnicza funkcja do pobrania ustawień
    def get_setting(key, default=None):
        try:
            return AppSetting.objects.get(key=key).value
        except AppSetting.DoesNotExist:
            return default

    prompt_system   = get_setting('prompt_system', 'Ekstrakcja danych z wyników badań.')
    default_model   = get_setting('default_model', 'gpt-4o')
    api_key         = get_setting('openai_api_key')

    openai.api_key = api_key or ''

    # Przygotowanie treści pliku
    if base64_str:
        content  = base64.b64decode(base64_str)
        filename = 'file'
    else:
        content  = file.read()
        filename = getattr(file, 'name', 'file')

    # Wiadomości do modelu: systemowy + plik jako załącznik
    messages = [
        {'role': 'system', 'content': prompt_system},
        {'role': 'user',   'content': f'<|file|{filename}|>'}
    ]
    files_payload = [{'filename': filename, 'data': content}]

    # Nowe wywołanie API bez openai.File.create
    response = openai.ChatCompletion.create(
        model    = default_model,
        messages = messages,
        files    = files_payload
    )

    # Parsowanie wyniku i statystyk
    result = response.choices[0].message.content
    usage  = response.usage

    # Zapis w historii
    OpenAIRequest.objects.create(
        user              = user,
        model             = response.model,
        prompt_tokens     = usage.prompt_tokens,
        completion_tokens = usage.completion_tokens,
        total_tokens      = usage.total_tokens
    )

    return result
