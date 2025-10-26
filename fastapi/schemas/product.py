from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    image_url: Optional[str] = None
    stock: int = 0


class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    image_url: Optional[str] = None
    stock: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
