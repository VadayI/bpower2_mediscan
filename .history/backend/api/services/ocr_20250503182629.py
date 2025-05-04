import openai, base64
from api.models import AppSetting, OpenAIRequest


def perform_ocr(file=None, base64_str=None, user=None):

    # Wczytanie ustawień z bazy
    def get_setting(key, default=None):
        try:
            return AppSetting.objects.get(key=key).value
        except AppSetting.DoesNotExist:
            return default

    prompt_system = get_setting('prompt_system', 'Ekstrakcja danych z wyników badań.')
    default_model = get_setting('default_model', 'gpt-4o')
    api_key = get_setting('openai_api_key')

    # Ustawienie klucza API OpenAI
    openai.api_key = api_key or ''

    # Wczytanie zawartości pliku lub dekodowanie base64
    if base64_str:
        content = base64.b64decode(base64_str)
    else:
        content = file.read()

    # Wywołanie API ChatGPT
    response = openai.ChatCompletion.create(
        model=default_model,
        messages=[{'role': 'system', 'content': prompt_system}],
        files=[{'content': content}]
    )

    # Wyciągnięcie wyniku i statystyk wykorzystania tokenów
    result = response.choices[0].message.content
    usage = response.usage

    # Zapisanie historii zapytania w bazie
    OpenAIRequest.objects.create(
        user=user,
        model=response.model,
        prompt_tokens=usage.prompt_tokens,
        completion_tokens=usage.completion_tokens,
        total_tokens=usage.total_tokens
    )

    return result
