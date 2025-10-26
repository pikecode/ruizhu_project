import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { CreatePaymentDto } from './dto/payment.dto';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private appId: string;
  private mchId: string;
  private apiKey: string;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private configService: ConfigService,
  ) {
    // 从环境变量读取微信支付配置
    this.appId = this.configService.get<string>('WECHAT_APP_ID') || 'test_app_id';
    this.mchId = this.configService.get<string>('WECHAT_MCH_ID') || 'test_mch_id';
    this.apiKey = this.configService.get<string>('WECHAT_API_KEY') || 'test_api_key';
  }

  /**
   * 创建支付订单
   */
  async createPayment(userId: number, createPaymentDto: CreatePaymentDto) {
    const { orderId, amount, paymentMethod = PaymentMethod.WECHAT } = createPaymentDto;

    // 查询订单
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new Error('订单不存在');
    }

    // 生成商户交易流水号
    const transactionNo = this.generateTransactionNo();

    // 创建支付记录
    const payment = this.paymentRepository.create({
      userId,
      orderId,
      amount,
      paymentMethod,
      transactionNo,
      status: PaymentStatus.PENDING,
    });

    const savedPayment: Payment = await this.paymentRepository.save(payment);

    // 调用微信支付API获取预支付ID
    if (paymentMethod === PaymentMethod.WECHAT) {
      const prepayData = await this.createWechatPrepay(savedPayment, userId);
      savedPayment.prepayId = prepayData.prepayId;
      savedPayment.wechatResponse = JSON.stringify(prepayData);
      await this.paymentRepository.save(savedPayment);

      return {
        paymentId: savedPayment.id,
        transactionNo: savedPayment.transactionNo,
        prepayId: prepayData.prepayId,
        // 返回微信支付所需的签名数据
        ...prepayData.clientData,
      };
    }

    return savedPayment;
  }

  /**
   * 创建微信预支付订单
   */
  private async createWechatPrepay(payment: Payment, userId: number) {
    // 这里应该调用真实的微信支付API
    // 以下是模拟实现，演示支付流程

    const prepayId = `wx${this.generateRandomString(32)}`;

    // 生成客户端签名信息
    const clientData = this.generateWechatSignature(prepayId);

    return {
      prepayId,
      clientData,
    };
  }

  /**
   * 生成微信支付签名
   */
  private generateWechatSignature(prepayId: string) {
    const timeStamp = Math.floor(Date.now() / 1000).toString();
    const nonceStr = this.generateRandomString(32);
    const packageStr = `prepay_id=${prepayId}`;

    // 生成签名
    const signStr = `appId=${this.appId}&nonceStr=${nonceStr}&package=${packageStr}&signType=MD5&timeStamp=${timeStamp}&key=${this.apiKey}`;
    const paySign = crypto
      .createHash('md5')
      .update(signStr)
      .digest('hex')
      .toUpperCase();

    return {
      appId: this.appId,
      timeStamp,
      nonceStr,
      package: packageStr,
      signType: 'MD5',
      paySign,
    };
  }

  /**
   * 处理微信支付回调
   */
  async handleWechatCallback(callbackData: any) {
    const { out_trade_no, transaction_id, trade_state, total_amount } = callbackData;

    // 查询支付记录
    const payment = await this.paymentRepository.findOne({
      where: { transactionNo: out_trade_no },
      relations: ['order'],
    });

    if (!payment) {
      throw new Error('支付记录不存在');
    }

    // 验证金额
    if (parseInt(total_amount) !== parseInt(payment.amount.toString())) {
      throw new Error('支付金额不匹配');
    }

    // 更新支付状态
    if (trade_state === 'SUCCESS') {
      payment.status = PaymentStatus.SUCCESS;
      payment.wechatTransactionId = transaction_id;
      payment.paidAt = new Date();
      payment.callbackData = JSON.stringify(callbackData);

      // 更新订单状态
      if (payment.order) {
        payment.order.status = OrderStatus.CONFIRMED;
        await this.orderRepository.save(payment.order);
      }
    } else if (trade_state === 'FAILED') {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = callbackData.trade_state_desc || '支付失败';
    }

    await this.paymentRepository.save(payment);
    return payment;
  }

  /**
   * 查询支付状态
   */
  async queryPaymentStatus(transactionNo: string) {
    const payment = await this.paymentRepository.findOne({
      where: { transactionNo },
      relations: ['order'],
    });

    if (!payment) {
      throw new Error('支付记录不存在');
    }

    // 如果状态是待支付或处理中，查询微信支付服务器
    if (payment.status === PaymentStatus.PENDING || payment.status === PaymentStatus.PROCESSING) {
      await this.queryWechatPaymentStatus(payment);
    }

    return payment;
  }

  /**
   * 查询微信支付状态
   */
  private async queryWechatPaymentStatus(payment: Payment) {
    // 这里应该调用微信支付查询API
    // 模拟实现：检查是否应该标记为已支付
    // 在生产环境中，需要调用真实的微信支付查询接口

    // 对于演示环境，我们假设在创建后30秒内没有支付就标记为失败
    const elapsedSeconds = (Date.now() - payment.createdAt.getTime()) / 1000;

    if (elapsedSeconds > 30 && payment.status === PaymentStatus.PENDING) {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = '支付超时';
      await this.paymentRepository.save(payment);
    }
  }

  /**
   * 获取支付记录
   */
  async getPayment(id: number) {
    return this.paymentRepository.findOne({
      where: { id },
      relations: ['order', 'user'],
    });
  }

  /**
   * 获取订单的支付记录
   */
  async getPaymentByOrderId(orderId: number) {
    return this.paymentRepository.findOne({
      where: { orderId },
      relations: ['order', 'user'],
    });
  }

  /**
   * 生成商户交易流水号
   */
  private generateTransactionNo(): string {
    const timestamp = Date.now().toString();
    const random = this.generateRandomString(8);
    return `PAY${timestamp}${random}`;
  }

  /**
   * 生成随机字符串
   */
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
