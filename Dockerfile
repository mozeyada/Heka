# Railway Dockerfile - Builds from backend directory
FROM python:3.11-slim

# Install CA certificates for SSL/TLS connections (needed for MongoDB Atlas)
RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend directory
COPY backend/ /app/

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port (Railway sets PORT env var at runtime)
EXPOSE 8000

# Start command - use shell form to expand PORT environment variable
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

