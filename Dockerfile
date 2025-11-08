# Railway Dockerfile - Builds from backend directory
FROM python:3.11-slim

WORKDIR /app

# Copy backend directory
COPY backend/ /app/

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE $PORT

# Start command
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT

