from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from ..models.order import OrderStatus


class OrderItemBase(BaseModel):
    product_id: int
    quantity: int


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemResponse(OrderItemBase):
    id: int
    unit_price: Decimal
    total_price: Decimal
    
    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    delivery_address: str
    delivery_date: Optional[date] = None
    delivery_time: Optional[str] = None
    notes: Optional[str] = None


class OrderCreate(OrderBase):
    items: List[OrderItemCreate]


class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    delivery_date: Optional[date] = None
    delivery_time: Optional[str] = None
    notes: Optional[str] = None


class OrderResponse(OrderBase):
    id: int
    customer_id: int
    farmer_id: int
    status: OrderStatus
    total_amount: Decimal
    created_at: datetime
    items: List[OrderItemResponse]
    
    class Config:
        from_attributes = True


class OrderWithDetails(OrderResponse):
    customer: "UserResponse"
    farmer: "UserResponse"
    
    class Config:
        from_attributes = True


class OrderStatusHistoryResponse(BaseModel):
    id: int
    order_id: int
    status: OrderStatus
    notes: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Import here to avoid circular imports
from .user import UserResponse