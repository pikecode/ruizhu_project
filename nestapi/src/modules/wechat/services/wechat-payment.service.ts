import { Injectable, BadRequestException, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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
import { OrdersService } from '../../orders/services/orders.service';
import { User } from '../../../entities/user.entity';
import { Order, Product } from '../../../entities/product.entity';

/**
 * 微信支付服务
 * 处理微信支付相关的业务逻辑
 * 包括：创建订单、处理支付回调、查询订单状态、发起退款等
 */
@Injectable()
export class WechatPaymentService {
  private readonly logger = new Logger(WechatPaymentService.name);

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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private configService: ConfigService,
    private ordersService: OrdersService,
    private dataSource: DataSource,
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

      // 确保 totalFee 是数字类型 (以分为单位)
      const totalFeeString = String(dto.totalFee);
      let totalFeeNumber = 0;

      // 支持两种格式: 分 (整数) 或 元/美元 (小数)
      if (totalFeeString.includes('.')) {
        // 如果包含小数点，假设是元/美元，转换为分
        const yuan = parseFloat(totalFeeString);
        totalFeeNumber = Math.round(yuan * 100);
      } else {
        // 否则假设已经是分
        totalFeeNumber = parseInt(totalFeeString, 10);
      }

      if (isNaN(totalFeeNumber) || totalFeeNumber <= 0) {
        throw new BadRequestException(`无效的支付金额: ${dto.totalFee} (转换后: ${totalFeeNumber}分)`);
      }

      // 构建下单请求参数 - 所有值都是字符串用于签名计算
      const orderData: Record<string, any> = {
        appid: this.appId,
        mch_id: this.mchId,
        nonce_str: nonceStr,
        body: dto.body,
        detail: dto.detail || '',
        out_trade_no: dto.outTradeNo,
        total_fee: String(totalFeeNumber), // 签名计算时使用字符串
        spbill_create_ip: '127.0.0.1', // 实际应该获取客户端IP
        notify_url: this.notifyUrl,
        trade_type: 'JSAPI',
        openid: dto.openid,
      };

      // 生成签名
      const sign = this.generateSign(orderData);
      orderData['sign'] = sign;

      // 转换 total_fee 回数字用于XML输出
      orderData.total_fee = totalFeeNumber;

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
        totalFee: totalFeeNumber,
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
        totalFee: totalFeeNumber,
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
   * 验证回调签名、更新支付状态，并同步更新关联订单的状态
   */
  async handlePaymentCallback(
    callbackData: WechatPaymentCallbackDto,
  ): Promise<void> {
    // 验证签名（在事务外执行）
    if (!this.verifyCallbackSign(callbackData)) {
      throw new BadRequestException('回调签名验证失败');
    }

    // 使用事务处理支付和订单的更新
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 查找对应的支付记录
      const payment = await queryRunner.manager.findOne(WechatPaymentEntity, {
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

        // 从 metadata 中提取 orderId 和 userId
        const metadata = payment.metadata as any;
        if (metadata && metadata.orderId && metadata.userId) {
          const orderId = metadata.orderId;
          const userId = metadata.userId;

          // 在同一事务内更新订单状态
          const order = await queryRunner.manager.findOne(Order, {
            where: { id: orderId, userId },
          });

          if (order) {
            if (order.status !== 'pending') {
              throw new Error(`订单状态不是pending，无法标记为已支付: status=${order.status}`);
            }

            // 🔴 关键: 验证支付金额与订单金额是否一致
            if (payment.totalFee !== order.totalAmount) {
              throw new Error(
                `支付金额不匹配: 支付金额=${payment.totalFee}分, 订单金额=${order.totalAmount}分。` +
                `可能是欺诈行为，订单未标记为已支付。`,
              );
            }

            order.status = 'paid';
            order.paidAt = new Date();
            await queryRunner.manager.save(Order, order);

            this.logger.log(
              `[事务内] 订单状态已更新为已支付: orderId=${orderId}, userId=${userId}`,
            );

            // 检查订单中是否有vip_recharge产品，在同一事务内更新用户discount
            try {
              await this.applyVipDiscountIfApplicableInTransaction(
                queryRunner,
                orderId,
                userId,
              );
            } catch (discountError) {
              // VIP折扣失败不应该回滚整个事务
              this.logger.error(
                `应用VIP折扣失败: orderId=${orderId}, userId=${userId}, error=${discountError.message}`,
              );
            }
          } else {
            this.logger.warn(
              `找不到订单: orderId=${orderId}, userId=${userId}`,
            );
          }
        } else {
          this.logger.warn(
            `支付回调中缺少订单信息: outTradeNo=${callbackData.out_trade_no}`,
          );
        }
      } else {
        payment.status = 'failed';
        this.logger.warn(
          `支付失败: outTradeNo=${callbackData.out_trade_no}, resultCode=${callbackData.result_code}`,
        );
      }

      payment.wechatCallback = callbackData;
      await queryRunner.manager.save(WechatPaymentEntity, payment);

      // 提交事务
      await queryRunner.commitTransaction();
      this.logger.log(`[事务已提交] 支付记录已保存: outTradeNo=${callbackData.out_trade_no}`);
    } catch (error) {
      // 回滚事务
      await queryRunner.rollbackTransaction();
      this.logger.error(`[事务已回滚] 处理支付回调出错: ${error.message}`);
      throw new HttpException(
        `处理支付回调失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 查询订单状态
   * 如果本地状态为pending，尝试从微信查询最新状态
   */
  async queryOrderStatus(
    dto: QueryOrderStatusDto,
  ): Promise<OrderStatusResponseDto> {
    try {
      // 从数据库查询支付记录
      let payment = await this.paymentRepository.findOne({
        where: { outTradeNo: dto.tradeNo },
      });

      if (!payment) {
        throw new BadRequestException('找不到对应的支付记录');
      }

      if (payment.openid !== dto.openid) {
        throw new BadRequestException('用户信息不匹配');
      }

      // 如果本地状态为pending，主动查询微信支付状态
      if (payment.status === 'pending') {
        try {
          this.logger.log(
            `本地状态为pending，主动查询微信支付状态: ${dto.tradeNo}`,
          );
          const wechatTradeState = await this.queryWechatOrderStatus(dto.tradeNo);

          // 更新本地状态
          if (wechatTradeState === 'SUCCESS') {
            payment.status = 'success';
            await this.paymentRepository.save(payment);
            this.logger.log(
              `从微信查询得到支付成功状态，已更新本地记录: ${dto.tradeNo}`,
            );
          } else if (wechatTradeState === 'NOTPAY') {
            payment.status = 'pending';
            this.logger.log(`微信显示订单未支付: ${dto.tradeNo}`);
          } else if (wechatTradeState === 'FAILED') {
            payment.status = 'failed';
            await this.paymentRepository.save(payment);
            this.logger.log(`微信显示订单支付失败: ${dto.tradeNo}`);
          }
        } catch (wechatError) {
          this.logger.warn(
            `主动查询微信支付状态失败 (可以继续返回本地状态): ${wechatError.message}`,
          );
          // 不中断，继续使用本地状态
        }
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
   * 查询微信支付状态
   * 调用微信订单查询API获取最新支付状态
   */
  private async queryWechatOrderStatus(
    outTradeNo: string,
  ): Promise<string> {
    try {
      const nonceStr = this.generateNonceStr();
      const queryData = {
        appid: this.appId,
        mch_id: this.mchId,
        nonce_str: nonceStr,
        out_trade_no: outTradeNo,
      };

      const sign = this.generateSign(queryData);
      queryData['sign'] = sign;

      const xmlData = this.jsonToXml(queryData);

      this.logger.log(`调用微信订单查询API: ${outTradeNo}`);
      const response = await axios.post(this.WECHAT_ORDER_QUERY, xmlData, {
        headers: { 'Content-Type': 'application/xml' },
      });

      const result = await this.parseXmlResponse(response.data as string);

      if (result.return_code !== 'SUCCESS') {
        throw new Error(`微信API返回错误: ${result.return_msg}`);
      }

      // 返回trade_state: SUCCESS, REFUND, NOTPAY, CLOSED, REVOKED, NOPAY, USERPAYING, PAYERROR
      const tradeState = result.trade_state || 'UNKNOWN';
      this.logger.log(
        `微信返回订单状态: ${outTradeNo} -> ${tradeState} (transaction_id: ${result.transaction_id})`,
      );

      // 保存微信返回的transaction_id
      if (tradeState === 'SUCCESS' && result.transaction_id) {
        const payment = await this.paymentRepository.findOne({
          where: { outTradeNo },
        });
        if (payment) {
          payment.transactionId = result.transaction_id;
          payment.wechatCallback = result;
          await this.paymentRepository.save(payment);
        }
      }

      return tradeState;
    } catch (error) {
      this.logger.error(
        `查询微信支付状态失败: ${error.message}`,
      );
      throw error;
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

      // 转换总金额
      let totalFeeNumber = 0;
      const totalFeeString = String(payment.totalFee);
      if (totalFeeString.includes('.')) {
        const yuan = parseFloat(totalFeeString);
        totalFeeNumber = Math.round(yuan * 100);
      } else {
        totalFeeNumber = parseInt(totalFeeString, 10);
      }

      // 转换退款金额
      let refundFeeNumber = 0;
      const refundFeeString = String(dto.refundFee || payment.totalFee);
      if (refundFeeString.includes('.')) {
        const yuan = parseFloat(refundFeeString);
        refundFeeNumber = Math.round(yuan * 100);
      } else {
        refundFeeNumber = parseInt(refundFeeString, 10);
      }

      if (isNaN(totalFeeNumber) || isNaN(refundFeeNumber) || totalFeeNumber <= 0 || refundFeeNumber <= 0) {
        throw new BadRequestException('无效的金额信息');
      }

      // 构建退款请求
      const nonceStr = this.generateNonceStr();
      const refundData = {
        appid: this.appId,
        mch_id: this.mchId,
        nonce_str: nonceStr,
        transaction_id: payment.transactionId || '',
        out_trade_no: dto.outTradeNo,
        out_refund_no: refundNo,
        total_fee: totalFeeNumber,
        refund_fee: refundFeeNumber,
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
        refundFee: refundFeeNumber,
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
   * 数字字段不使用CDATA，字符串字段使用CDATA
   */
  private jsonToXml(data: Record<string, any>): string {
    let xml = '<xml>';
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];
        // 数字字段不使用CDATA
        if (typeof value === 'number') {
          xml += `<${key}>${value}</${key}>`;
        } else {
          xml += `<${key}><![CDATA[${value}]]></${key}>`;
        }
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

  /**
   * 检查订单中是否有vip_recharge产品，如果有则更新用户discount
   * 当用户购买VIP充值产品时，使用产品中的discount值覆盖用户的discount字段
   * @param orderId - 订单ID
   * @param userId - 用户ID
   */
  /**
   * 在事务内应用VIP折扣（用于支付回调）
   * @param queryRunner 数据库事务运行器
   * @param orderId 订单ID
   * @param userId 用户ID
   */
  private async applyVipDiscountIfApplicableInTransaction(
    queryRunner: any,
    orderId: number,
    userId: number,
  ): Promise<void> {
    try {
      // 在事务内查询订单
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: orderId },
        relations: ['items'],
      });

      if (!order || !order.items || order.items.length === 0) {
        this.logger.debug(
          `订单未找到或无订单项: orderId=${orderId}, userId=${userId}`,
        );
        return;
      }

      // 检查订单中是否有vip_recharge产品
      let vipProductDiscount: number | null = null;

      for (const item of order.items) {
        // 查询产品信息
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId },
        });

        if (
          product &&
          product.productType === 'vip_recharge' &&
          product.discount
        ) {
          vipProductDiscount = product.discount;
          this.logger.log(
            `找到VIP充值产品: productId=${item.productId}, discount=${vipProductDiscount}`,
          );
          break;
        }
      }

      // 如果找到VIP产品，在事务内更新用户的discount字段
      if (vipProductDiscount !== null) {
        const user = await queryRunner.manager.findOne(User, {
          where: { id: userId },
        });

        if (!user) {
          this.logger.warn(`用户未找到: userId=${userId}`);
          return;
        }

        const oldDiscount = user.discount;
        user.discount = vipProductDiscount;
        await queryRunner.manager.save(User, user);

        this.logger.log(
          `[事务内] 用户VIP折扣已更新: userId=${userId}, orderId=${orderId}, oldDiscount=${oldDiscount}, newDiscount=${vipProductDiscount}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `[事务内] 应用VIP折扣时出错: orderId=${orderId}, userId=${userId}, error=${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async applyVipDiscountIfApplicable(
    orderId: string,
    userId: string,
  ): Promise<void> {
    try {
      // 查询订单，获取所有订单项
      const order = await this.orderRepository.findOne({
        where: { id: parseInt(orderId, 10) },
        relations: ['items'],
      });

      if (!order || !order.items || order.items.length === 0) {
        this.logger.debug(
          `订单未找到或无订单项: orderId=${orderId}, userId=${userId}`,
        );
        return;
      }

      // 检查订单中是否有vip_recharge产品
      let vipProductDiscount: number | null = null;

      for (const item of order.items) {
        // 查询产品信息
        const product = await this.productRepository.findOne({
          where: { id: item.productId },
        });

        if (
          product &&
          product.productType === 'vip_recharge' &&
          product.discount
        ) {
          vipProductDiscount = product.discount;
          this.logger.log(
            `找到VIP充值产品: productId=${item.productId}, discount=${vipProductDiscount}`,
          );
          break; // 只需要找到一个VIP产品，因为一个订单中可能有多个VIP产品但我们只取第一个
        }
      }

      // 如果找到VIP产品，更新用户的discount字段
      if (vipProductDiscount !== null) {
        const user = await this.userRepository.findOne({
          where: { id: parseInt(userId, 10) },
        });

        if (!user) {
          this.logger.warn(`用户未找到: userId=${userId}`);
          return;
        }

        const oldDiscount = user.discount;
        user.discount = vipProductDiscount;
        await this.userRepository.save(user);

        this.logger.log(
          `用户VIP折扣已更新: userId=${userId}, orderId=${orderId}, oldDiscount=${oldDiscount}, newDiscount=${vipProductDiscount}`,
        );
      }
    } catch (error) {
      // 捕获异常但不中断支付流程
      this.logger.error(
        `应用VIP折扣时出错: orderId=${orderId}, userId=${userId}, error=${error.message}`,
        error.stack,
      );
      throw error; // 向上抛出异常由调用者处理
    }
  }
}
