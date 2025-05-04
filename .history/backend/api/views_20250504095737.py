from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

import json

from .services.ocr import perform_ocr

class OCRView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('file')
        base64_str = request.data.get('base64')
        # Wywołujemy serwis OCR wraz z informacją o użytkowniku
        result = perform_ocr(file=file, base64_str=base64_str, user=request.user)
        try:
            result = json.loads(result)
        except:
            result = None
        return Response(result, status=status.HTTP_200_OK)
