#!/usr/bin/env bash
# Alternative build script for Render.com

set -o errexit  # exit on error

echo "Starting build process..."

# Use Python 3.11 explicitly
export PYTHON_VERSION=3.11

# Upgrade pip and install build tools
python -m pip install --upgrade pip setuptools wheel

# Try main requirements first, fallback to minimal
if pip install -r requirements.txt; then
    echo "Main requirements installed successfully"
else
    echo "Main requirements failed, trying minimal requirements..."
    pip install -r requirements-minimal.txt
fi

# Initialize database
echo "Initializing database..."
python init_db.py

echo "Build completed successfully!"