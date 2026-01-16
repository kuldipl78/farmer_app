from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from ..models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str
    role: UserRole


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None


class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class FarmerProfileBase(BaseModel):
    farm_name: str
    farm_address: str
    farm_description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    certification_type: Optional[str] = None
    years_experience: Optional[int] = None


class FarmerProfileCreate(FarmerProfileBase):
    pass


class FarmerProfileUpdate(BaseModel):
    farm_name: Optional[str] = None
    farm_address: Optional[str] = None
    farm_description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    certification_type: Optional[str] = None
    years_experience: Optional[int] = None


class FarmerProfileResponse(FarmerProfileBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class CustomerProfileBase(BaseModel):
    delivery_address: Optional[str] = None
    preferred_delivery_time: Optional[str] = None


class CustomerProfileCreate(CustomerProfileBase):
    pass


class CustomerProfileUpdate(CustomerProfileBase):
    pass


class CustomerProfileResponse(CustomerProfileBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True