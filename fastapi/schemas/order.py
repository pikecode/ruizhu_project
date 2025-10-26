from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class OrderCreate(BaseModel):
    product_id: int
    product_name: str
    quantity: int = 1
    unit_price: float
    total_price: float
    remark: Optional[str] = None
    address_id: Optional[int] = None
    phone: Optional[str] = None


class OrderResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    total_price: float
    status: str
    remark: Optional[str] = None
    address_id: Optional[int] = None
    phone: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
