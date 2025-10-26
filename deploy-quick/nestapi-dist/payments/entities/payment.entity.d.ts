import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';
export declare enum PaymentStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    SUCCESS = "success",
    FAILED = "failed",
    CANCELLED = "cancelled",
    REFUNDED = "refunded"
}
export declare enum PaymentMethod {
    WECHAT = "wechat",
    ALIPAY = "alipay",
    CARD = "card"
}
export declare class Payment {
    id: number;
    transactionNo: string;
    wechatTransactionId: string;
    userId: number;
    user: User;
    orderId: number;
    order: Order;
    amount: number;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    prepayId: string;
    wechatResponse: string;
    callbackData: string;
    paidAt: Date;
    failureReason: string;
    createdAt: Date;
    updatedAt: Date;
}
