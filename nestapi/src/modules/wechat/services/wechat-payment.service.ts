import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as xml2js from 'xml2js';
import axios from 'axios';
import { WechatPaymentEntity } from '../entities/wechat-payment.entity';
import {
  CreateUnifiedOrderDto,
  UnifiedOrderResponseDto,
  CreatePaymentResponseDto,
  WechatPaymentCallbackDto,
  QueryOrderStatusDto,
  OrderStatusResponseDto,
  RefundRequestDto,
  RefundResponseDto,
} from '../dto/wechat-payment.dto';

/**
 * 微信支付服务
 * 处理微信支付相关的业务逻辑
 * 包括：创建订单、处理支付回调、查询订单状态、发起退款等
 */
@Injectable()
export class WechatPaymentService {
  // 微信支付API基础URL
  private readonly WECHAT_PAY_API = 'https://api.mch.weixin.qq.com/pay';
  private readonly WECHAT_UNIFIED_ORDER = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
  private readonly WECHAT_ORDER_QUERY = 'https://api.mch.weixin.qq.com/pay/orderquery';
  private readonly WECHAT_REFUND = 'https://api.mch.weixin.qq.com/secapi/pay/refund';

  private readonly appId: string;
  private readonly mchId: string;
  private readonly mchKey: string;
  private readonly notifyUrl: string;

  constructor(
    @InjectRepository(WechatPaymentEntity)
    private readonly paymentRepository: Repository<WechatPaymentEntity>,
    private configService: ConfigService,
  ) {
    this.appId = configService.get<string>('WECHAT_APP_ID') || '';
    this.mchId = configService.get<string>('WECHAT_MCH_ID', '');
    this.mchKey = configService.get<string>('WECHAT_MCH_KEY', '');
    this.notifyUrl = configService.get<string>('WECHAT_PAY_NOTIFY_URL', '');
  }

  /**
   * 创建统一下单请求
   * 调用微信支付统一下单API生成预付订单
   */
  async createUnifiedOrder(
    dto: CreateUnifiedOrderDto,
  ): Promise<CreatePaymentResponseDto> {
    try {
      // 生成随机字符串
      const nonceStr = this.generateNonceStr();
      const timeStamp = Math.floor(Date.now() / 1000).toString();

      // 构建下单请求参数
      const orderData = {
        appid: this.appId,
        mch_id: this.mchId,
        nonce_str: nonceStr,
        body: dto.body,
        detail: dto.detail || '',
        out_trade_no: dto.outTradeNo,
        total_fee: dto.totalFee,
        spbill_create_ip: '127.0.0.1', // 实际应该获取客户端IP
        notify_url: this.notifyUrl,
        trade_type: 'JSAPI',
        openid: dto.openid,
      };

      // 生成签名
      const sign = this.generateSign(orderData);
      orderData['sign'] = sign;

      // 将请求参数转换为XML格式
      const xmlData = this.jsonToXml(orderData);

      // 调用微信统一下单API
      const response = await axios.post(this.WECHAT_UNIFIED_ORDER, xmlData, {
        headers: { 'Content-Type': 'application/xml' },
      });

      // 解析XML响应
      const result = await this.parseXmlResponse(response.data as string);

      if (result.return_code !== 'SUCCESS') {
        throw new BadRequestException(`微信支付API错误: ${result.return_msg}`);
      }

      if (result.result_code !== 'SUCCESS') {
        throw new BadRequestException(
          `微信支付业务错误: ${result.err_code_des || result.err_code}`,
        );
      }

      // 保存支付记录到数据库
      const payment = this.paymentRepository.create({
        openid: dto.openid,
        outTradeNo: dto.outTradeNo,
        prepayId: result.prepay_id,
        totalFee: dto.totalFee,
        body: dto.body,
        detail: dto.detail,
        status: 'pending',
        metadata: dto.metadata,
        remark: dto.remark,
      });

      await this.paymentRepository.save(payment);

      // 生成客户端支付签名
      const paySign = this.generatePaySign(result.prepay_id, nonceStr, timeStamp);

      return {
        outTradeNo: dto.outTradeNo,
        prepayId: result.prepay_id,
        timeStamp,
        nonceStr,
        signType: 'MD5',
        paySign,
        totalFee: dto.totalFee,
        body: dto.body,
      };
    } catch (error) {
      throw new HttpException(
        `创建支付订单失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 处理微信支付回调
   * 验证回调签名和数据完整性
   */
  async handlePaymentCallback(
    callbackData: WechatPaymentCallbackDto,
  ): Promise<void> {
    try {
      // 验证签名
      if (!this.verifyCallbackSign(callbackData)) {
        throw new BadRequestException('回调签名验证失败');
      }

      // 查找对应的支付记录
      const payment = await this.paymentRepository.findOne({
        where: { outTradeNo: callbackData.out_trade_no },
      });

      if (!payment) {
        throw new BadRequestException('找不到对应的支付记录');
      }

      // 更新支付状态
      if (callbackData.result_code === 'SUCCESS') {
        payment.status = 'success';
        payment.transactionId = callbackData.transaction_id || '';
        if (callbackData.time_end) {
          payment.payTime = new Date(
            callbackData.time_end.replace(
              /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
              '$1-$2-$3T$4:$5:$6Z',
            ),
          );
        }
      } else {
        payment.status = 'failed';
      }

      payment.wechatCallback = callbackData;
      await this.paymentRepository.save(payment);
    } catch (error) {
      throw new HttpException(
        `处理支付回调失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 查询订单状态
   */
  async queryOrderStatus(
    dto: QueryOrderStatusDto,
  ): Promise<OrderStatusResponseDto> {
    try {
      // 从数据库查询支付记录
      const payment = await this.paymentRepository.findOne({
        where: { outTradeNo: dto.tradeNo },
      });

      if (!payment) {
        throw new BadRequestException('找不到对应的支付记录');
      }

      if (payment.openid !== dto.openid) {
        throw new BadRequestException('用户信息不匹配');
      }

      return {
        outTradeNo: payment.outTradeNo,
        status: payment.status,
        totalFee: payment.totalFee,
        payTime: payment.payTime,
        transactionId: payment.transactionId,
      };
    } catch (error) {
      throw new HttpException(
        `查询订单状态失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 发起退款申请
   */
  async createRefund(dto: RefundRequestDto): Promise<RefundResponseDto> {
    try {
      // 从数据库查询支付记录
      const payment = await this.paymentRepository.findOne({
        where: { outTradeNo: dto.outTradeNo },
      });

      if (!payment) {
        throw new BadRequestException('找不到对应的支付记录');
      }

      if (payment.openid !== dto.openid) {
        throw new BadRequestException('用户信息不匹配');
      }

      if (payment.status !== 'success') {
        throw new BadRequestException('只有已支付的订单才能退款');
      }

      // 生成退款单号
      const refundNo = `REF${Date.now()}`;
      const refundFee = dto.refundFee || payment.totalFee;

      // 构建退款请求
      const nonceStr = this.generateNonceStr();
      const refundData = {
        appid: this.appId,
        mch_id: this.mchId,
        nonce_str: nonceStr,
        transaction_id: payment.transactionId || '',
        out_trade_no: dto.outTradeNo,
        out_refund_no: refundNo,
        total_fee: payment.totalFee,
        refund_fee: refundFee,
        refund_desc: dto.reason,
      };

      // 生成签名
      const sign = this.generateSign(refundData);
      refundData['sign'] = sign;

      // 将请求参数转换为XML格式
      const xmlData = this.jsonToXml(refundData);

      // 调用微信退款API
      const response = await axios.post(this.WECHAT_REFUND, xmlData, {
        headers: { 'Content-Type': 'application/xml' },
      });

      // 解析XML响应
      const result = await this.parseXmlResponse(response.data as string);

      if (result.return_code !== 'SUCCESS') {
        throw new BadRequestException(`微信支付API错误: ${result.return_msg}`);
      }

      if (result.result_code !== 'SUCCESS') {
        throw new BadRequestException(
          `微信支付业务错误: ${result.err_code_des || result.err_code}`,
        );
      }

      return {
        outTradeNo: dto.outTradeNo,
        status: 'processing',
        refundFee,
        refundId: result.refund_id,
      };
    } catch (error) {
      throw new HttpException(
        `发起退款失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 生成随机字符串
   */
  private generateNonceStr(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * 生成MD5签名
   */
  private generateSign(data: Record<string, any>): string {
    // 过滤sign和empty值
    const filteredData = Object.keys(data)
      .filter((key) => data[key] !== '' && key !== 'sign')
      .sort()
      .reduce((acc, key) => {
        acc[key] = data[key];
        return acc;
      }, {});

    // 构建签名字符串
    let signStr = Object.keys(filteredData)
      .map((key) => `${key}=${filteredData[key]}`)
      .join('&');

    signStr += `&key=${this.mchKey}`;

    // 生成MD5签名
    return crypto.createHash('md5').update(signStr, 'utf8').digest('hex').toUpperCase();
  }

  /**
   * 生成客户端支付签名
   */
  private generatePaySign(prepayId: string, nonceStr: string, timeStamp: string): string {
    const payData = {
      appId: this.appId,
      timeStamp,
      nonceStr,
      package: `prepay_id=${prepayId}`,
      signType: 'MD5',
    };

    let signStr = Object.keys(payData)
      .sort()
      .map((key) => `${key}=${payData[key]}`)
      .join('&');

    signStr += `&key=${this.mchKey}`;

    return crypto.createHash('md5').update(signStr, 'utf8').digest('hex').toUpperCase();
  }

  /**
   * 验证回调签名
   */
  private verifyCallbackSign(data: Record<string, any>): boolean {
    const sign = data.sign;
    const filteredData = { ...data };
    delete filteredData.sign;

    const calculatedSign = this.generateSign(filteredData);
    return sign === calculatedSign;
  }

  /**
   * JSON转XML
   */
  private jsonToXml(data: Record<string, any>): string {
    let xml = '<xml>';
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        xml += `<${key}><![CDATA[${data[key]}]]></${key}>`;
      }
    }
    xml += '</xml>';
    return xml;
  }

  /**
   * 解析XML响应
   */
  private async parseXmlResponse(xmlStr: string): Promise<Record<string, any>> {
    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: true,
    });

    const result = await parser.parseStringPromise(xmlStr);
    return result.xml;
  }
}
