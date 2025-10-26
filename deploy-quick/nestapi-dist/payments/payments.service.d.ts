import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { CreatePaymentDto } from './dto/payment.dto';
export declare class PaymentsService {
    private paymentRepository;
    private orderRepository;
    private configService;
    private appId;
    private mchId;
    private apiKey;
    constructor(paymentRepository: Repository<Payment>, orderRepository: Repository<Order>, configService: ConfigService);
    createPayment(userId: number, createPaymentDto: CreatePaymentDto): unknown;
    private createWechatPrepay;
    private generateWechatSignature;
    handleWechatCallback(callbackData: any): unknown;
    queryPaymentStatus(transactionNo: string): unknown;
    private queryWechatPaymentStatus;
    getPayment(id: number): unknown;
    getPaymentByOrderId(orderId: number): unknown;
    private generateTransactionNo;
    private generateRandomString;
}
