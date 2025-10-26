from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.product import Product
from schemas.product import ProductCreate, ProductResponse

router = APIRouter(prefix="/api/v1/products", tags=["products"])


@router.post("/", response_model=ProductResponse)
async def create_product(product_data: ProductCreate, db: Session = Depends(get_db)):
    new_product = Product(**product_data.dict())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("/", response_model=list[ProductResponse])
async def list_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return products


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(product_id: int, product_data: ProductCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for key, value in product_data.dict().items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
async def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()
    return {"message": "Product deleted"}
