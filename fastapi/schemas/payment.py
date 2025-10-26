from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PaymentCreate(BaseModel):
    order_id: int
    amount: float
    payment_method: str = "wechat"


class PaymentResponse(BaseModel):
    id: int
    transaction_no: str
    user_id: int
    order_id: int
    amount: float
    payment_method: str
    status: str
    prepay_id: Optional[str] = None
    wechat_transaction_id: Optional[str] = None
    paid_at: Optional[datetime] = None
    failure_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
