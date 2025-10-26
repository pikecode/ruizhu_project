from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.order import Order
from schemas.order import OrderCreate, OrderResponse

router = APIRouter(prefix="/api/v1/orders", tags=["orders"])


@router.post("/", response_model=OrderResponse)
async def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    new_order = Order(**order_data.dict())
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.get("/", response_model=list[OrderResponse])
async def list_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    return orders


@router.put("/{order_id}/status")
async def update_order_status(order_id: int, status: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status
    db.commit()
    db.refresh(order)
    return order
