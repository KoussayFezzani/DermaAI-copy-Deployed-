# Production Dockerfile for DermaAI Backend
FROM python:3.11-slim

# System dependencies for OpenCV, GUI-less image processing, and certificates
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy application source code
COPY . .

# Ensure upload directory exists
RUN mkdir -p uploads

# Expose port (default 5000)
EXPOSE 5000

ENV FLASK_ENV=production
ENV FLASK_DEBUG=0
ENV PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Production WSGI server (Default 1 worker to stay safely within ~2GB RAM, configurable via GUNICORN_WORKERS)
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:5000 --workers ${GUNICORN_WORKERS:-1} --timeout 120 'app:create_app()'"]
