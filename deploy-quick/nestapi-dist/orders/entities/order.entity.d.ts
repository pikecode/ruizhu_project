import { User } from '../../users/entities/user.entity';
import { Address } from '../../addresses/entities/address.entity';
export declare enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}
export declare class Order {
    id: number;
    userId: number;
    user: User;
    addressId: number;
    address: Address;
    productId: number;
    productName: string;
    quantity: number;
    phone: string;
    totalPrice: number;
    unitPrice: number;
    status: OrderStatus;
    remark: string;
    createdAt: Date;
    updatedAt: Date;
}
