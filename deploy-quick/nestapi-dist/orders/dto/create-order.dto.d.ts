export declare enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    CANCELLED = "cancelled",
    REFUNDED = "refunded"
}
export declare class CreateOrderDto {
    addressId: number;
    couponCode?: string;
    phone: string;
}
export declare class UpdateOrderStatusDto {
    status: OrderStatus;
}
