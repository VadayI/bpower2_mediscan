import openai, base64
from django.conf import settings

def perform_ocr(file=None, base64_str=None):
    if base64_str:
        content = base64.b64decode(base64_str)
    else:
        content = file.read()
    # Przygotuj prompt do ChatGPT z zawartością pliku
    response = openai.ChatCompletion.create(
        model='gpt-4o',
        messages=[{'role':'system','content':'...'}],
        files=[{'content': content}]
    )
    result = response.choices[0].message.content
    usage = response.usage
    return result, usage