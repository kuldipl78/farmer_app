#!/usr/bin/env bash
# Render.com start script

set -e  # Exit on any error

echo "🚀 Starting Farmer Marketplace API..."
echo "📋 Environment Info:"
echo "   Port: $PORT"
echo "   Python: $(python --version)"
echo "   Working Directory: $(pwd)"

# Test startup before launching
echo "🔍 Running startup tests..."
python test_startup.py

if [ $? -ne 0 ]; then
    echo "❌ Startup tests failed! Check the logs above."
    exit 1
fi

echo "✅ Startup tests passed!"

# Start the FastAPI application with Gunicorn
echo "🌐 Starting Gunicorn server..."
exec gunicorn app.main:app \
    --bind 0.0.0.0:$PORT \
    --workers 1 \
    --worker-class uvicorn.workers.UvicornWorker \
    --timeout 120 \
    --keep-alive 2 \
    --max-requests 1000 \
    --max-requests-jitter 50 \
    --log-level info \
    --access-logfile - \
    --error-logfile -