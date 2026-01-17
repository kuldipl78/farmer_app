#!/usr/bin/env bash
# Render.com start script

# Start the FastAPI application with Gunicorn
gunicorn app.main:app --bind 0.0.0.0:$PORT --workers 2 --worker-class uvicorn.workers.UvicornWorker