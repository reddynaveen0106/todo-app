# Build stage: install dependencies into an isolated virtual environment
FROM python:3.12-slim AS builder

WORKDIR /app
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Runtime stage: copy only the virtual environment and application code
FROM python:3.12-slim

WORKDIR /app
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY --from=builder /opt/venv /opt/venv
COPY main.py .

RUN useradd --system --no-create-home appuser \
    && chown -R appuser:appuser /app /opt/venv

USER appuser

EXPOSE 8088
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8088"]
