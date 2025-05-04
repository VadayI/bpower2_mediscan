import base64
from io import BytesIO
from openai import OpenAI
import mimetypes
from PIL import Image

from api.models import AppSetting, OpenAIRequest


def perform_ocr(file=None, base64_str=None, user=None):
    # Helper to fetch settings
    def get_setting(key, default=None):
        try:
            return AppSetting.objects.get(key=key).value
        except AppSetting.DoesNotExist:
            return default

    prompt_system = get_setting('prompt_system', '')
    default_model = get_setting('default_model', 'gpt-4o')
    api_key       = get_setting('openai_api_key')

    client = OpenAI(api_key=api_key)

    # Read input bytes and filename
    if base64_str:
        data_bytes = base64.b64decode(base64_str)
        filename   = 'file'
    else:
        data_bytes = file.read()
        filename   = getattr(file, 'name', 'file')

    # Determine MIME type
    mime_type, _ = mimetypes.guess_type(filename)
    if mime_type and mime_type.startswith('image/'):
        # Convert image to PDF
        image = Image.open(BytesIO(data_bytes)).convert('RGB')
        buffer = BytesIO()
        image.save(buffer, format='PDF')
        data_bytes = buffer.getvalue()
        mime_type = 'application/pdf'
        filename = filename.rsplit('.', 1)[0] + '.pdf'

    # Fallback for unknown
    if not mime_type:
        mime_type = 'application/pdf' if filename.lower().endswith('.pdf') else 'application/pdf'

    # Base64 encode
    data_b64  = base64.b64encode(data_bytes).decode('utf-8')
    file_data = f"data:{mime_type};base64,{data_b64}"

    # Build single input entry
    input_entry = {
        'role': 'user',
        'content': [
            {'type': 'input_text', 'text': prompt_system},
            {'type': 'input_file', 'filename': filename, 'file_data': file_data}
        ]
    }

    # Call Responses API
    response = client.responses.create(
        model=default_model,
        input=[input_entry],
        text={'format': {'type': 'json_object'}},
        tools=[],
        temperature=0,
        max_output_tokens=32768,
        top_p=1,
        store=False
    )

    # Extract output
    result = getattr(response, 'output_text', '')
    usage  = getattr(response, 'usage', None)

    # Save history
    OpenAIRequest.objects.create(
        user              = user,
        model             = default_model,
        prompt_tokens     = usage.input_tokens     if usage else 0,
        completion_tokens = usage.output_tokens if usage else 0,
        total_tokens      = usage.total_tokens      if usage else 0
    )

    return result
