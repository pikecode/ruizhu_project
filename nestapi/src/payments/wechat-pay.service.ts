import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios, { AxiosError } from 'axios';
import * as crypto from 'crypto';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { CreateWechatPayDto, WechatPayResponseDto } from './dto/wechat-pay.dto';

@Injectable()
export class WechatPayService {
  private readonly logger = new Logger(WechatPayService.name);
  private readonly mchid: string;
  private readonly apiKey: string;
  private readonly appid: string;
  private readonly appSecret: string;
  private readonly baseUrl = 'https://api.mch.weixin.qq.com/v3';

  constructor(
    private configService: ConfigService,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
  ) {
    this.mchid = '1730538714';
    this.apiKey = 'RUIZHUYISHUYUNjie202510261214111';
    this.appid = 'wx0377b6b22ea7e8fc';
    this.appSecret = '280b67f53e797ea2fce9de440c1bf506';
  }

  /**
   * 创建微信支付订单
   */
  async createPayment(
    userId: number,
    createWechatPayDto: CreateWechatPayDto,
  ): Promise<WechatPayResponseDto> {
    const { orderId, description } = createWechatPayDto;

    // 获取订单
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new BadRequestException('订单不存在');
    }

    if (order.userId !== userId) {
      throw new BadRequestException('无权限访问此订单');
    }

    // 检查订单是否已支付
    const existingPayment = await this.paymentsRepository.findOne({
      where: { orderId },
    });

    if (existingPayment && existingPayment.status === PaymentStatus.SUCCESS) {
      throw new BadRequestException('订单已支付');
    }

    // 创建支付记录
    const payment = this.paymentsRepository.create({
      orderId,
      userId,
      amount: Math.round(order.totalPrice * 100), // 转换为分
      status: PaymentStatus.PENDING,
      paymentMethod: PaymentMethod.WECHAT,
      transactionNo: this.generateOutTradeNo(orderId),
    });

    await this.paymentsRepository.save(payment);

    // 调用微信统一下单接口
    const prepayData = await this.unifiedOrder(
      payment.transactionNo,
      Math.round(order.totalPrice * 100),
      description || `订单 ${orderId}`,
    );

    // 生成客户端支付参数
    const clientPayData = this.generateClientPayData(prepayData.prepay_id);

    return clientPayData;
  }

  /**
   * 微信统一下单接口
   */
  private async unifiedOrder(
    outTradeNo: string,
    totalAmount: number,
    description: string,
  ): Promise<{ prepay_id: string }> {
    const requestBody = {
      mchid: this.mchid,
      appid: this.appid,
      description,
      out_trade_no: outTradeNo,
      notify_url: `${this.configService.get('API_BASE_URL')}/payments/wechat-callback`,
      amount: {
        total: totalAmount,
        currency: 'CNY',
      },
      scene_info: {
        device_id: 'WEB',
      },
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/pay/transactions/jsapi`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: this.getAuthorizationHeader(
              'POST',
              '/v3/pay/transactions/jsapi',
              requestBody,
            ),
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error('微信统一下单失败', error);
      throw new BadRequestException('创建支付订单失败');
    }
  }

  /**
   * 生成客户端支付参数
   */
  private generateClientPayData(prepayId: string): WechatPayResponseDto {
    const timeStamp = Math.floor(Date.now() / 1000).toString();
    const nonceStr = this.generateNonceStr();
    const pkg = `prepay_id=${prepayId}`;

    const paySign = this.generatePaySign({
      appid: this.appid,
      timeStamp,
      nonceStr,
      package: pkg,
    });

    return {
      appid: this.appid,
      timeStamp,
      nonceStr,
      package: pkg,
      signType: 'RSA',
      paySign,
      prepay_id: prepayId,
    };
  }

  /**
   * 生成签名（用于客户端支付）
   */
  private generatePaySign(params: {
    appid: string;
    timeStamp: string;
    nonceStr: string;
    package: string;
  }): string {
    const message = `${params.appid}\n${params.timeStamp}\n${params.nonceStr}\n${params.package}\n`;

    // 这里使用 HMAC-SHA256 签名
    // 实际环境中需要使用微信提供的 RSA 私钥
    return crypto
      .createHmac('sha256', this.apiKey)
      .update(message)
      .digest('hex');
  }

  /**
   * 获取授权头（用于调用微信 API）
   */
  private getAuthorizationHeader(
    method: string,
    path: string,
    body?: any,
  ): string {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = this.generateNonceStr();

    let message = `${method}\n${path}\n${timestamp}\n${nonce}\n`;
    if (body) {
      message += JSON.stringify(body);
    }

    const signature = crypto
      .createHmac('sha256', this.apiKey)
      .update(message)
      .digest('hex');

    return `WECHATPAY2-SHA256-RSA2048 mchid="${this.mchid}",nonce_str="${nonce}",timestamp="${timestamp}",serial_no="xxx",signature="${signature}"`;
  }

  /**
   * 处理微信支付回调
   */
  async handleCallback(callbackData: any): Promise<void> {
    try {
      // 验证签名
      const isValid = this.verifySignature(
        callbackData,
        callbackData.signature,
      );

      if (!isValid) {
        throw new BadRequestException('签名验证失败');
      }

      const { out_trade_no, trade_state } = callbackData.resource;

      // 更新支付记录
      const payment = await this.paymentsRepository.findOne({
        where: { transactionNo: out_trade_no },
      });

      if (!payment) {
        this.logger.warn(`支付记录不存在: ${out_trade_no}`);
        return;
      }

      if (trade_state === 'SUCCESS') {
        payment.status = PaymentStatus.SUCCESS;
        payment.wechatTransactionId = callbackData.resource.transaction_id;
        payment.paidAt = new Date();

        await this.paymentsRepository.save(payment);

        // 更新订单状态
        const order = await this.ordersRepository.findOne({
          where: { id: payment.orderId },
        });

        if (order) {
          order.status = OrderStatus.CONFIRMED;
          await this.ordersRepository.save(order);
          this.logger.log(`订单支付成功: ${payment.orderId}`);
        }
      } else if (
        trade_state === 'REFUND' ||
        trade_state === 'NOTPAY' ||
        trade_state === 'CLOSED'
      ) {
        payment.status = PaymentStatus.FAILED;
        await this.paymentsRepository.save(payment);
      }
    } catch (error) {
      this.logger.error('处理支付回调失败', error);
      throw error;
    }
  }

  /**
   * 验证回调签名
   */
  private verifySignature(data: any, signature: string): boolean {
    const message = `${data.timestamp}\n${data.nonce}\n${JSON.stringify(data.resource)}\n`;
    const expectedSignature = crypto
      .createHmac('sha256', this.apiKey)
      .update(message)
      .digest('hex');

    return signature === expectedSignature;
  }

  /**
   * 查询支付状态
   */
  async queryPaymentStatus(outTradeNo: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/pay/transactions/out-trade-no/${outTradeNo}`,
        {
          params: { mchid: this.mchid },
          headers: {
            Authorization: this.getAuthorizationHeader(
              'GET',
              `/v3/pay/transactions/out-trade-no/${outTradeNo}?mchid=${this.mchid}`,
            ),
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error('查询支付状态失败', error);
      throw new BadRequestException('查询支付状态失败');
    }
  }

  /**
   * 申请退款
   */
  async refund(
    outTradeNo: string,
    outRefundNo: string,
    refundAmount: number,
    totalAmount: number,
  ): Promise<any> {
    const requestBody = {
      out_trade_no: outTradeNo,
      out_refund_no: outRefundNo,
      reason: '用户申请退款',
      amount: {
        refund: refundAmount,
        total: totalAmount,
        currency: 'CNY',
      },
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/refund/domestic/refunds`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: this.getAuthorizationHeader(
              'POST',
              '/v3/refund/domestic/refunds',
              requestBody,
            ),
          },
        },
      );

      // 更新支付记录
      const payment = await this.paymentsRepository.findOne({
        where: { transactionNo: outTradeNo },
      });

      if (payment) {
        payment.status = PaymentStatus.REFUNDED;
        await this.paymentsRepository.save(payment);
      }

      return response.data;
    } catch (error) {
      this.logger.error('申请退款失败', error);
      throw new BadRequestException('申请退款失败');
    }
  }

  /**
   * 生成商户订单号
   */
  private generateOutTradeNo(orderId: number): string {
    const timestamp = Date.now().toString().slice(-8);
    return `RUIZHU${orderId}${timestamp}`;
  }

  /**
   * 生成随机字符串
   */
  private generateNonceStr(): string {
    return crypto.randomBytes(16).toString('hex');
  }
}
