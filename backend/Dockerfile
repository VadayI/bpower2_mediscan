FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
ENV PATH=/root/.local/bin:$PATH
COPY --from=builder /root/.local /root/.local

# To kopiuje zarówno manage.py, jak i moduł mediscan, api, entrypoint itp.
COPY . .

RUN mkdir -p /app/staticfiles

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

CMD ["gunicorn", "mediscan.wsgi:application", "--bind", "0.0.0.0:8319", "--keep-alive", "0", "--timeout", "120"]
