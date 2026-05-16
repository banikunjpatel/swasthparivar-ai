FROM python:3.11-slim

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Production: gunicorn with uvicorn workers
# WEB_CONCURRENCY defaults to 2; override via env on EC2
CMD ["sh", "-c", "gunicorn app.app:app -w ${WEB_CONCURRENCY:-2} -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --timeout 120 --graceful-timeout 30 --access-logfile - --error-logfile -"]
