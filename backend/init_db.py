#!/usr/bin/env python3
"""Initialize the database with tables and sample data."""

from sqlalchemy import create_engine
from app.database import Base
from app.models import *  # Import all models
from app.config import settings

def init_database():
    """Create all tables and add sample data."""
    engine = create_engine(settings.database_url)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")
    
    # Add sample categories
    from sqlalchemy.orm import sessionmaker
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        from app.models.category import Category
        
        # Check if categories already exist
        if db.query(Category).count() == 0:
            categories = [
                Category(name="Vegetables", description="Fresh vegetables and leafy greens"),
                Category(name="Fruits", description="Seasonal fruits and berries"),
                Category(name="Herbs", description="Fresh herbs and spices"),
                Category(name="Grains", description="Rice, wheat, and other grains"),
                Category(name="Dairy", description="Fresh milk, cheese, and dairy products"),
                Category(name="Eggs", description="Farm fresh eggs"),
                Category(name="Meat", description="Fresh meat and poultry"),
                Category(name="Honey", description="Natural honey and bee products"),
            ]
            
            for category in categories:
                db.add(category)
            
            db.commit()
            print("✅ Sample categories added successfully!")
        else:
            print("ℹ️  Categories already exist, skipping...")
            
    except Exception as e:
        print(f"❌ Error adding sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()