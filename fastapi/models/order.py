from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    product_name = Column(String(255))
    quantity = Column(Integer, default=1)
    unit_price = Column(Float)
    total_price = Column(Float)
    status = Column(String(50), default="pending")
    remark = Column(Text, nullable=True)
    address_id = Column(Integer, nullable=True)
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
