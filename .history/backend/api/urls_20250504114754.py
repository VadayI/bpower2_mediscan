from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from django.views.generic import RedirectView
from django.conf import settings

from api.views import OCRView

urlpatterns = [
    path(
        '',
        RedirectView.as_view(url=settings.FRONTEND_URL, permanent=False),
        name='root-redirect'
    ),
    path('ocr/', OCRView.as_view(), name='ocr'),
    path('auth/token/login/', obtain_auth_token, name='api_token_auth'),
]