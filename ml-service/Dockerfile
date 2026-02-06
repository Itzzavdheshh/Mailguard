# ==================================================
# Stage: Production ML Service
# ==================================================
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies for scikit-learn and pandas
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (layer caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and models
COPY . .

# Create persistent directories for volumes
RUN mkdir -p /app/models /app/datasets

# Copy initial models to persistent directory if they exist
# This ensures first startup works even without volume data
RUN if [ -f vectorizer.pkl ]; then cp vectorizer.pkl /app/models/; fi && \
    if [ -f phishing_model.pkl ]; then cp phishing_model.pkl /app/models/; fi && \
    if [ -f sample_training.csv ]; then cp sample_training.csv /app/datasets/; fi

# Expose ML service port
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
# Configure paths for Docker volume persistence
ENV MODEL_DIR=/app/models
ENV DATASET_DIR=/app/datasets

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

# Start FastAPI with uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
