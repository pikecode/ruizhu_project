from .health import router as health_router
from .users import router as users_router
from .products import router as products_router
from .orders import router as orders_router
from .payments import router as payments_router

__all__ = [
    "health_router",
    "users_router",
    "products_router",
    "orders_router",
    "payments_router",
]
