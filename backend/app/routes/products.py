from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.user import User
from ..models.product import Product
from ..models.category import Category
from ..utils.auth import get_current_user, get_current_farmer

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/")
def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    category_id: Optional[int] = None,
    farmer_id: Optional[int] = None,
    is_organic: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all available products with filters."""
    query = db.query(Product).filter(Product.is_active == True, Product.quantity_available > 0)
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    if farmer_id:
        query = query.filter(Product.farmer_id == farmer_id)
    
    if is_organic is not None:
        query = query.filter(Product.is_organic == is_organic)
    
    if search:
        query = query.filter(Product.name.contains(search))
    
    products = query.offset(skip).limit(limit).all()
    return products


@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product by ID."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product


@router.post("/")
def create_product(
    product_data: dict,
    current_user: User = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Create a new product (farmers only)."""
    from ..schemas.product import ProductCreate
    
    # Validate input data
    validated_data = ProductCreate(**product_data)
    
    # Verify category exists
    category = db.query(Category).filter(Category.id == validated_data.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    db_product = Product(
        farmer_id=current_user.id,
        **validated_data.dict()
    )
    
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@router.put("/{product_id}")
def update_product(
    product_id: int,
    product_data: dict,
    current_user: User = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Update a product (owner only)."""
    from ..schemas.product import ProductUpdate
    
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.farmer_id == current_user.id
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or not owned by you"
        )
    
    # Validate input data
    validated_data = ProductUpdate(**product_data)
    
    # Update fields
    update_data = validated_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Delete a product (owner only)."""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.farmer_id == current_user.id
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or not owned by you"
        )
    
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}


@router.get("/farmer/my-products")
def get_my_products(
    current_user: User = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """Get all products for the current farmer."""
    products = db.query(Product).filter(Product.farmer_id == current_user.id).all()
    return products