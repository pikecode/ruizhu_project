from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import (
    health_router,
    users_router,
    products_router,
    orders_router,
    payments_router,
)
from config import settings

# Create tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="FastAPI Backend",
    description="Python API for e-commerce platform",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(users_router)
app.include_router(products_router)
app.include_router(orders_router)
app.include_router(payments_router)


@app.get("/")
async def root():
    return {
        "message": "Welcome to FastAPI Backend",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True
    )
