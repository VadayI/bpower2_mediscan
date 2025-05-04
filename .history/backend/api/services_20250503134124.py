from .models import AppSetting

def get_app_setting(key, default=None):
    try:
        return AppSetting.objects.get(key=key).value
    except AppSetting.DoesNotExist:
        return default
