#!/bin/sh

# Wymaga ustawienia w pliku .env:
# OPENAI_API_KEY, PROMPT_SYSTEM, DEFAULT_MODEL,
# ADMIN_USER, ADMIN_EMAIL, ADMIN_PASSWORD


# Skrypt inicjalizacyjny dla MediScan
# 1. Migracje bazy danych
# 2. Tworzenie domyślnych AppSetting z .env jeśli nie istnieją
# 3. Tworzenie superużytkownika jeśli nie istnieje

# 1. Uruchom migracje
echo "==> Uruchamianie migracji..."
python manage.py migrate

# 2. Inicjalizacja AppSetting
echo "==> Inicjalizacja ustawień aplikacji (AppSetting)..."
python manage.py shell <<EOF
from api.models import AppSetting
import os

# Lista kluczy i domyślnych wartości pobieranych z .env
defaults = {
    'prompt_system': os.getenv('PROMPT_SYSTEM', 'Ekstrakcja danych z wyników badań.'),
    'default_model': os.getenv('DEFAULT_MODEL', 'gpt-4o-mini'),
    'openai_api_key': os.getenv('OPENAI_API_KEY', ''),
}

for key, value in defaults.items():
    AppSetting.objects.get_or_create(key=key, defaults={'value': value})
EOF

# 3. Tworzenie superużytkownika
echo "==> Sprawdzanie superużytkownika..."
python manage.py shell <<EOF
from django.contrib.auth import get_user_model
import os

User = get_user_model()
ADMIN_USER = os.getenv('ADMIN_USER', 'admin')
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'admin@example.com')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'adminpass')

if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser(
        username=ADMIN_USER,
        email=ADMIN_EMAIL,
        password=ADMIN_PASSWORD
    )
    print(f"Superuser '{ADMIN_USER}' utworzony.")
else:
    print("Superuser już istnieje.")
EOF

# 4. Zbieranie statycznych plików
echo "==> Zbieranie statycznych plików…"
python manage.py collectstatic --noinput

# 5. Uruchomienie serwera przekazane przez CMD
exec "$@"
