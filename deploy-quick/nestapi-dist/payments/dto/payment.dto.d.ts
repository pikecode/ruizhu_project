import { PaymentMethod } from '../entities/payment.entity';
export declare class CreatePaymentDto {
    orderId: number;
    amount: number;
    paymentMethod?: PaymentMethod;
}
export declare class PaymentCallbackDto {
    transactionId: string;
    outTradeNo: string;
    totalAmount: number;
    tradeState: string;
    tradeType: string;
    bankType?: string;
    attach?: string;
    timeEnd: string;
}
export declare class PaymentQueryDto {
    outTradeNo: string;
}
