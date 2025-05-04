from django.contrib import admin
from .models import OpenAIRequest, AppSetting

@admin.register(OpenAIRequest)
class OpenAIRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'model', 'prompt_tokens', 'completion_tokens', 'total_tokens', 'date')
    list_filter = ('model', 'date', 'user')
    search_fields = ('user__username', 'model')

@admin.register(AppSetting)
class AppSettingAdmin(admin.ModelAdmin):
    list_display = ('key', 'value')
    search_fields = ('key',)
