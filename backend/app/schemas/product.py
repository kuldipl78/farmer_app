from pydantic import BaseModel
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date
from decimal import Decimal

if TYPE_CHECKING:
    from .user import UserResponse
    from .category import CategoryResponse


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price_per_unit: Decimal
    unit_type: str
    quantity_available: int
    min_order_quantity: int = 1
    harvest_date: Optional[date] = None
    expiry_date: Optional[date] = None
    is_organic: bool = False
    image_urls: Optional[List[str]] = None


class ProductCreate(ProductBase):
    category_id: int


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price_per_unit: Optional[Decimal] = None
    unit_type: Optional[str] = None
    quantity_available: Optional[int] = None
    min_order_quantity: Optional[int] = None
    harvest_date: Optional[date] = None
    expiry_date: Optional[date] = None
    is_organic: Optional[bool] = None
    image_urls: Optional[List[str]] = None
    category_id: Optional[int] = None
    is_active: Optional[bool] = None


class ProductResponse(ProductBase):
    id: int
    farmer_id: int
    category_id: int
    is_active: bool
    created_at: datetime
    is_available: bool
    
    class Config:
        from_attributes = True


class ProductWithFarmer(ProductResponse):
    farmer: "UserResponse"
    
    class Config:
        from_attributes = True


class ProductWithCategory(ProductResponse):
    category: "CategoryResponse"
    
    class Config:
        from_attributes = True