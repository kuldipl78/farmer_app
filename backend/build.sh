#!/usr/bin/env bash
# Render.com build script

set -o errexit  # exit on error

# Upgrade pip and install wheel
pip install --upgrade pip setuptools wheel

# Install Python dependencies
pip install -r requirements.txt

# Initialize database (create tables and sample data)
python init_db.py