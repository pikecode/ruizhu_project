import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';
export declare class OrderItem {
    id: number;
    orderId: number;
    order: Order;
    productId: number;
    product: Product;
    productName: string;
    productSku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    selectedColor: string;
    selectedSize: string;
    createdAt: Date;
}
