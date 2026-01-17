#!/usr/bin/env bash
# Render.com build script

set -o errexit  # exit on error

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Initialize database (create tables and sample data)
python init_db.py