from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.payment import Payment
from models.order import Order
from schemas.payment import PaymentCreate, PaymentResponse
import hashlib
import random
import string
from datetime import datetime

router = APIRouter(prefix="/api/v1/payments", tags=["payments"])


def generate_transaction_no():
    timestamp = str(int(datetime.now().timestamp() * 1000))
    random_str = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
    return f"PAY{timestamp}{random_str}"


def generate_wechat_signature(app_id: str, mch_id: str, api_key: str, prepay_id: str):
    timestamp = str(int(datetime.now().timestamp()))
    nonce_str = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
    package = f"prepay_id={prepay_id}"

    sign_str = f"appId={app_id}&nonceStr={nonce_str}&package={package}&signType=MD5&timeStamp={timestamp}&key={api_key}"
    pay_sign = hashlib.md5(sign_str.encode()).hexdigest().upper()

    return {
        "appId": app_id,
        "timeStamp": timestamp,
        "nonceStr": nonce_str,
        "package": package,
        "signType": "MD5",
        "paySign": pay_sign,
    }


@router.post("/create", response_model=PaymentResponse)
async def create_payment(payment_data: PaymentCreate, db: Session = Depends(get_db)):
    # Check if order exists
    order = db.query(Order).filter(Order.id == payment_data.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Create payment record
    transaction_no = generate_transaction_no()
    new_payment = Payment(
        transaction_no=transaction_no,
        order_id=payment_data.order_id,
        amount=payment_data.amount,
        payment_method=payment_data.payment_method,
        status="pending"
    )

    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)

    # Generate WeChat signature (mock)
    prepay_id = f"wx{''.join(random.choices(string.ascii_letters + string.digits, k=32))}"
    new_payment.prepay_id = prepay_id
    db.commit()

    return new_payment


@router.get("/{transaction_no}", response_model=PaymentResponse)
async def get_payment(transaction_no: str, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.transaction_no == transaction_no).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment


@router.post("/wechat/callback")
async def wechat_callback(callback_data: dict, db: Session = Depends(get_db)):
    transaction_no = callback_data.get("out_trade_no")
    payment = db.query(Payment).filter(Payment.transaction_no == transaction_no).first()

    if not payment:
        return {"code": "FAIL", "message": "Payment not found"}

    # Update payment status
    if callback_data.get("trade_state") == "SUCCESS":
        payment.status = "success"
        payment.wechat_transaction_id = callback_data.get("transaction_id")
        payment.paid_at = datetime.now()

        # Update order status
        order = db.query(Order).filter(Order.id == payment.order_id).first()
        if order:
            order.status = "confirmed"

    db.commit()

    return {"code": "SUCCESS", "message": "OK"}
