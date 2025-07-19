# Multi-stage Docker build for Music and You

# Base Python image
FROM python:3.11-slim as base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONHASHSEED=random \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    libpq-dev \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Create application user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set work directory
WORKDIR /app

# Development stage
FROM base as development

# Install development dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Install development tools
RUN pip install \
    black \
    isort \
    flake8 \
    mypy \
    pytest \
    pytest-cov \
    jupyter

# Copy source code
COPY . .

# Install package in development mode
RUN pip install -e .

# Change ownership to appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose ports
EXPOSE 8080 8888

# Default command for development
CMD ["python", "-m", "music_and_you.cli", "serve"]

# Production stage
FROM base as production

# Install only production dependencies
COPY requirements.txt .
RUN pip install --no-deps -r requirements.txt

# Copy application code
COPY src/ /app/src/
COPY pyproject.toml /app/

# Install package
RUN pip install .

# Create data directories
RUN mkdir -p /app/data /app/logs /app/models

# Change ownership to appuser
RUN chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python -m music_and_you.cli health || exit 1

# Expose port
EXPOSE 8080

# Production command
CMD ["python", "-m", "music_and_you.cli", "serve"]
