from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from .views import OCRView

urlpatterns = [
    path('ocr/', OCRView.as_view(), name='ocr'),
    path('auth/token/login/', obtain_auth_token, name='api_token_auth'),
]