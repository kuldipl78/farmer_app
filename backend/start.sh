#!/usr/bin/env bash
# Render.com start script

echo "Starting Farmer Marketplace API..."
echo "Port: $PORT"
echo "Environment: Production"

# Start the FastAPI application with Gunicorn
exec gunicorn app.main:app \
    --bind 0.0.0.0:$PORT \
    --workers 2 \
    --worker-class uvicorn.workers.UvicornWorker \
    --timeout 120 \
    --keep-alive 2 \
    --max-requests 1000 \
    --max-requests-jitter 50 \
    --preload