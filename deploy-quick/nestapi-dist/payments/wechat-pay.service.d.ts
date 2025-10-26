import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { Payment } from './entities/payment.entity';
import { CreateWechatPayDto, WechatPayResponseDto } from './dto/wechat-pay.dto';
export declare class WechatPayService {
    private configService;
    private ordersRepository;
    private paymentsRepository;
    private readonly logger;
    private readonly mchid;
    private readonly apiKey;
    private readonly appid;
    private readonly appSecret;
    private readonly baseUrl;
    constructor(configService: ConfigService, ordersRepository: Repository<Order>, paymentsRepository: Repository<Payment>);
    createPayment(userId: number, createWechatPayDto: CreateWechatPayDto): Promise<WechatPayResponseDto>;
    private unifiedOrder;
    private generateClientPayData;
    private generatePaySign;
    private getAuthorizationHeader;
    handleCallback(callbackData: any): Promise<void>;
    private verifySignature;
    queryPaymentStatus(outTradeNo: string): Promise<any>;
    refund(outTradeNo: string, outRefundNo: string, refundAmount: number, totalAmount: number): Promise<any>;
    private generateOutTradeNo;
    private generateNonceStr;
}
