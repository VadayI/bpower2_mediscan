# Etap 1: instalacja zależności Pythona
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Etap 2: obraz produkcyjny
FROM python:3.12-slim
WORKDIR /app
ENV PATH=/root/.local/bin:$PATH

# Przenosimy zainstalowane pakiety Pythona
COPY --from=builder /root/.local /root/.local

# Kopiujemy kod backendu (manage.py, mediscan/, api/, entrypoint.sh itp.)
COPY . .

# Przygotowujemy katalog dla plików statycznych
RUN mkdir -p /app/staticfiles

# EntryPoint: migracje, init AppSettings i superuser
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

# Start aplikacji na porcie 8319
CMD ["gunicorn", "mediscan.wsgi:application", "--bind", "0.0.0.0:8319", "--timeout", "120"]