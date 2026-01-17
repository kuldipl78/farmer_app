#!/usr/bin/env bash
# Render.com build script

set -o errexit  # exit on error

echo "Starting build process..."

# Upgrade pip and install wheel
pip install --upgrade pip setuptools wheel

# Install Python dependencies
pip install -r requirements.txt

echo "Testing configuration..."
python test_config.py

echo "Initializing database..."
python init_db.py

echo "Build completed successfully!"