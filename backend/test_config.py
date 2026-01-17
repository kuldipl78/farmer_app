#!/usr/bin/env python3
"""Test configuration loading."""

import os
import sys

# Set test environment variables
os.environ["DATABASE_URL"] = "postgresql://test:test@localhost/test"
os.environ["ALLOWED_ORIGINS"] = "*"
os.environ["DEBUG"] = "False"

try:
    from app.config import settings
    
    print("✅ Configuration loaded successfully!")
    print(f"Database URL: {settings.database_url}")
    print(f"Allowed Origins: {settings.allowed_origins}")
    print(f"Debug: {settings.debug}")
    print(f"Port: {settings.port}")
    
    # Test CORS origins
    if settings.allowed_origins == ["*"]:
        print("✅ CORS origins configured correctly for production")
    else:
        print(f"ℹ️  CORS origins: {settings.allowed_origins}")
    
    sys.exit(0)
    
except Exception as e:
    print(f"❌ Configuration failed: {e}")
    sys.exit(1)