from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.category import Category

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("/")
def get_categories(db: Session = Depends(get_db)):
    """Get all active categories."""
    from ..schemas.category import CategoryResponse
    categories = db.query(Category).filter(Category.is_active == True).all()
    return categories