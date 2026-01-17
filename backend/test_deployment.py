#!/usr/bin/env python3
"""Test script to verify deployment readiness."""

import sys
import os

def test_imports():
    """Test if all required modules can be imported."""
    try:
        print("Testing imports...")
        
        # Test FastAPI
        import fastapi
        print(f"✅ FastAPI {fastapi.__version__}")
        
        # Test Pydantic
        import pydantic
        print(f"✅ Pydantic {pydantic.__version__}")
        
        # Test SQLAlchemy
        import sqlalchemy
        print(f"✅ SQLAlchemy {sqlalchemy.__version__}")
        
        # Test database driver
        import psycopg2
        print(f"✅ psycopg2 {psycopg2.__version__}")
        
        # Test app modules
        from app.main import app
        print("✅ App main module")
        
        from app.config import settings
        print("✅ App config")
        
        from app.database import Base
        print("✅ Database base")
        
        print("\n🎉 All imports successful!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def test_database_url():
    """Test database URL configuration."""
    from app.config import settings
    
    print(f"\nDatabase URL: {settings.database_url}")
    
    if "postgresql://" in settings.database_url:
        print("✅ Using PostgreSQL (production)")
    elif "sqlite://" in settings.database_url:
        print("✅ Using SQLite (development)")
    else:
        print("❌ Unknown database type")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 Testing deployment readiness...\n")
    
    success = True
    success &= test_imports()
    success &= test_database_url()
    
    if success:
        print("\n✅ Deployment test passed!")
        sys.exit(0)
    else:
        print("\n❌ Deployment test failed!")
        sys.exit(1)