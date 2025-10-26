import type { RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { WechatPayService } from './wechat-pay.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { CreateWechatPayDto } from './dto/wechat-pay.dto';
import { Request } from 'express';
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly wechatPayService;
    constructor(paymentsService: PaymentsService, wechatPayService: WechatPayService);
    createPayment(user: any, createPaymentDto: CreatePaymentDto): unknown;
    handleWechatCallback(req: RawBodyRequest<Request>): unknown;
    queryPaymentStatus(transactionNo: string): unknown;
    getPaymentDetail(id: string): unknown;
    getPaymentByOrderId(orderId: string): unknown;
    createWechatJSAPIPayment(user: any, createWechatPayDto: CreateWechatPayDto): unknown;
    handleWechatV3Callback(req: RawBodyRequest<Request>): unknown;
    getWechatPaymentStatus(outTradeNo: string): unknown;
    refundWechatPayment(refundData: {
        outTradeNo: string;
        outRefundNo: string;
        refundAmount: number;
        totalAmount: number;
    }): unknown;
}
