from rest_framework import serializers
from .models import OpenAIRequest, AppSetting

class OpenAIRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpenAIRequest
        fields = '__all__'

class AppSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppSetting
        fields = ['key', 'value']