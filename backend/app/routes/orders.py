from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal
from ..database import get_db
from ..models.user import User
from ..models.product import Product
from ..models.order import Order, OrderItem, OrderStatusHistory, OrderStatus
from ..utils.auth import get_current_user, get_current_customer, get_current_farmer

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/")
def create_order(
    order_data: dict,
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    """Create a new order (customers only)."""
    from ..schemas.order import OrderCreate
    
    # Validate input data
    validated_data = OrderCreate(**order_data)
    
    if not validated_data.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item"
        )
    
    # Validate products and calculate total
    total_amount = Decimal('0.00')
    farmer_id = None
    order_items_data = []
    
    for item in validated_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {item.product_id} not found"
            )
        
        if not product.is_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {product.name} is not available"
            )
        
        if item.quantity > product.quantity_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough stock for {product.name}. Available: {product.quantity_available}"
            )
        
        if item.quantity < product.min_order_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Minimum order quantity for {product.name} is {product.min_order_quantity}"
            )
        
        # All items must be from the same farmer
        if farmer_id is None:
            farmer_id = product.farmer_id
        elif farmer_id != product.farmer_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="All items in an order must be from the same farmer"
            )
        
        item_total = product.price_per_unit * item.quantity
        total_amount += item_total
        
        order_items_data.append({
            'product_id': item.product_id,
            'quantity': item.quantity,
            'unit_price': product.price_per_unit,
            'total_price': item_total
        })
    
    # Create order
    db_order = Order(
        customer_id=current_user.id,
        farmer_id=farmer_id,
        total_amount=total_amount,
        delivery_address=validated_data.delivery_address,
        delivery_date=validated_data.delivery_date,
        delivery_time=validated_data.delivery_time,
        notes=validated_data.notes
    )
    
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # Create order items
    for item_data in order_items_data:
        order_item = OrderItem(order_id=db_order.id, **item_data)
        db.add(order_item)
        
        # Reduce product quantity
        product = db.query(Product).filter(Product.id == item_data['product_id']).first()
        product.quantity_available -= item_data['quantity']
    
    # Create initial status history
    status_history = OrderStatusHistory(
        order_id=db_order.id,
        status=OrderStatus.PENDING,
        notes="Order created"
    )
    db.add(status_history)
    
    db.commit()
    db.refresh(db_order)
    return db_order


@router.get("/")
def get_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get orders for current user."""
    if current_user.role == "customer":
        orders = db.query(Order).filter(Order.customer_id == current_user.id).all()
    elif current_user.role == "farmer":
        orders = db.query(Order).filter(Order.farmer_id == current_user.id).all()
    else:
        orders = db.query(Order).all()
    
    return orders


@router.get("/{order_id}")
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific order."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check permissions
    if current_user.role == "customer" and order.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )
    elif current_user.role == "farmer" and order.farmer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )
    
    return order


@router.put("/{order_id}")
def update_order_status(
    order_id: int,
    order_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update order status."""
    from ..schemas.order import OrderUpdate
    
    # Validate input data
    validated_data = OrderUpdate(**order_data)
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check permissions
    if current_user.role == "farmer" and order.farmer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this order"
        )
    elif current_user.role == "customer" and order.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this order"
        )
    
    # Update order
    update_data = validated_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(order, field, value)
    
    # Add status history if status changed
    if validated_data.status:
        status_history = OrderStatusHistory(
            order_id=order.id,
            status=validated_data.status,
            notes=f"Status updated by {current_user.role}"
        )
        db.add(status_history)
    
    db.commit()
    db.refresh(order)
    return order