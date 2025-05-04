import base64
from io import BytesIO
from openai import OpenAI
from django.conf import settings
from ..models import AppSetting, OpenAIRequest
import mimetypes

def perform_ocr(file=None, base64_str=None, user=None):
    # Pobranie ustawień
    def get_setting(key, default=None):
        try:
            return AppSetting.objects.get(key=key).value
        except AppSetting.DoesNotExist:
            return default

    prompt_system = get_setting('prompt_system', '')
    default_model = get_setting('default_model', 'gpt-4o')
    api_key       = get_setting('openai_api_key')

    client = OpenAI(api_key=api_key)

    # Przygotowanie pliku
    if base64_str:
        data_bytes = base64.b64decode(base64_str)
        filename   = 'file'
    else:
        data_bytes = file.read()
        filename   = getattr(file, 'name', 'file')

    data_b64 = base64.b64encode(data_bytes).decode('utf-8')
    mime_type, _ = mimetypes.guess_type(filename)
    if not mime_type:
        mime_type = 'application/pdf' if filename.lower().endswith('.pdf') else 'application/octet-stream'
    file_data = f"data:{mime_type};base64,{data_b64}"

    # Budujemy *jedno* wejście, ale z tablicą content
    input_entry = {
        'role': 'user',
        'content': [
            { 'type': 'input_text', 'text': prompt_system },
            { 'type': 'input_file',  'filename': filename, 'file_data': file_data }
        ]
    }

    # Wywołanie Responses API
    response = client.responses.create(
        model=default_model,
        input=[input_entry],
        # opcjonalne ustawienia formatu/limitów itp.
        text={'format': {'type': 'json_object'}},
        reasoning={},
        tools=[],
        temperature=0,
        max_output_tokens=32768,
        top_p=1,
        store=False
    )

    # Odczyt wyników
    result = getattr(response, 'output_text', '')
    usage  = getattr(response, 'usage', None)

    # Zapis w historii
    OpenAIRequest.objects.create(
        user              = user,
        model             = default_model,
        prompt_tokens     = usage.input_tokens     if usage else 0,
        completion_tokens = usage.output_tokens if usage else 0,
        total_tokens      = usage.total_tokens      if usage else 0
    )

    return result