from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    transaction_no = Column(String(100), unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    order_id = Column(Integer, ForeignKey("orders.id"))
    amount = Column(Float)
    payment_method = Column(String(50), default="wechat")
    status = Column(String(50), default="pending")
    prepay_id = Column(String(255), nullable=True)
    wechat_transaction_id = Column(String(100), nullable=True)
    wechat_response = Column(Text, nullable=True)
    callback_data = Column(Text, nullable=True)
    paid_at = Column(DateTime, nullable=True)
    failure_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
