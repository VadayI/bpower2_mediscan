from django.urls import path
from api.views import OCRView

urlpatterns = [
    path('ocr/', OCRView.as_view(), name='ocr'),
]