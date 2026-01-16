from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base
import enum


class UserRole(str, enum.Enum):
    FARMER = "farmer"
    CUSTOMER = "customer"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20))
    is_active = Column(Boolean, default=True, index=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False)
    customer_profile = relationship("CustomerProfile", back_populates="user", uselist=False)
    
    # For farmers
    products = relationship("Product", foreign_keys="Product.farmer_id", back_populates="farmer")
    farmer_orders = relationship("Order", foreign_keys="Order.farmer_id", back_populates="farmer")
    
    # For customers  
    customer_orders = relationship("Order", foreign_keys="Order.customer_id", back_populates="customer")
    
    # Reviews
    given_reviews = relationship("Review", foreign_keys="Review.reviewer_id", back_populates="reviewer")
    received_reviews = relationship("Review", foreign_keys="Review.reviewed_id", back_populates="reviewed")
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"