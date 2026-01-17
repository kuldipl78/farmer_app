#!/usr/bin/env python3
"""Test script to identify startup issues."""

import os
import sys
from pathlib import Path

def test_imports():
    """Test if all imports work correctly."""
    print("🔍 Testing imports...")
    
    try:
        from app.config import settings
        print("✅ Config imported successfully")
        print(f"   Database URL: {settings.database_url[:50]}...")
        print(f"   Debug mode: {settings.debug}")
    except Exception as e:
        print(f"❌ Config import failed: {e}")
        return False
    
    try:
        from app.database import engine, Base
        print("✅ Database imports successful")
    except Exception as e:
        print(f"❌ Database import failed: {e}")
        return False
    
    try:
        from app.models.user import User
        from app.models.category import Category
        print("✅ Model imports successful")
    except Exception as e:
        print(f"❌ Model import failed: {e}")
        return False
    
    try:
        from app.routes import auth, products, orders, categories
        print("✅ Route imports successful")
    except Exception as e:
        print(f"❌ Route import failed: {e}")
        return False
    
    return True

def test_database_connection():
    """Test database connection."""
    print("\n🔍 Testing database connection...")
    
    try:
        from app.database import engine
        from sqlalchemy import text
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ Database connection successful")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_app_creation():
    """Test FastAPI app creation."""
    print("\n🔍 Testing FastAPI app creation...")
    
    try:
        from app.main import app
        print("✅ FastAPI app created successfully")
        print(f"   Title: {app.title}")
        print(f"   Version: {app.version}")
        return True
    except Exception as e:
        print(f"❌ FastAPI app creation failed: {e}")
        return False

def main():
    """Run all tests."""
    print("🚀 Starting backend startup tests...\n")
    
    # Check environment
    print("📋 Environment variables:")
    print(f"   PORT: {os.getenv('PORT', 'Not set')}")
    print(f"   DATABASE_URL: {os.getenv('DATABASE_URL', 'Not set')[:50]}...")
    print(f"   SECRET_KEY: {'Set' if os.getenv('SECRET_KEY') else 'Not set'}")
    print()
    
    tests = [
        ("Import Test", test_imports),
        ("Database Connection", test_database_connection),
        ("App Creation", test_app_creation),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                print(f"❌ {test_name} failed")
        except Exception as e:
            print(f"❌ {test_name} crashed: {e}")
        print()
    
    print(f"📊 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend should start successfully.")
        return 0
    else:
        print("⚠️  Some tests failed. Check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())