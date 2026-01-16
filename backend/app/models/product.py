from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, DECIMAL, Boolean, Date, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base


class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    price_per_unit = Column(DECIMAL(10, 2), nullable=False, index=True)
    unit_type = Column(String(50), nullable=False)  # kg, piece, bunch, etc.
    quantity_available = Column(Integer, nullable=False, default=0)
    min_order_quantity = Column(Integer, default=1)
    harvest_date = Column(Date, index=True)
    expiry_date = Column(Date)
    is_organic = Column(Boolean, default=False)
    image_urls = Column(JSON)  # Array of image URLs
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    farmer = relationship("User", foreign_keys=[farmer_id], back_populates="products")
    category = relationship("Category", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")
    
    @property
    def is_available(self):
        return self.is_active and self.quantity_available > 0