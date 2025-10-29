import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Res,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { WechatPaymentService } from '../services/wechat-payment.service';
import {
  CreateUnifiedOrderDto,
  CreatePaymentResponseDto,
  WechatPaymentCallbackDto,
  QueryOrderStatusDto,
  OrderStatusResponseDto,
  RefundRequestDto,
  RefundResponseDto,
} from '../dto/wechat-payment.dto';

/**
 * 微信支付控制器
 * 处理所有与微信支付相关的API请求
 */
@ApiTags('WeChat Payment')
@Controller('wechat/payment')
export class WechatPaymentController {
  private readonly logger = new Logger(WechatPaymentController.name);

  constructor(private readonly wechatPaymentService: WechatPaymentService) {}

  /**
   * 创建支付订单
   * 小程序调用此接口创建支付订单并获取支付参数
   *
   * 工作流程：
   * 1. 小程序发送orderCode请求到后端
   * 2. 后端调用微信统一下单API创建预付订单
   * 3. 微信返回prepay_id
   * 4. 后端生成支付签名并返回给小程序
   * 5. 小程序使用这些参数调用wx.requestPayment()发起支付
   */
  @Post('create-order')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create WeChat payment order',
    description:
      'Call WeChat unified order API to create prepaid order and generate payment parameters',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment order created successfully',
    type: CreatePaymentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request parameters or WeChat API error',
  })
  async createOrder(
    @Body() createOrderDto: CreateUnifiedOrderDto,
  ): Promise<{ code: number; message: string; data: CreatePaymentResponseDto }> {
    this.logger.log(`Creating payment order for openid: ${createOrderDto.openid}`);

    const data = await this.wechatPaymentService.createUnifiedOrder(createOrderDto);

    return {
      code: 200,
      message: 'Payment order created successfully',
      data,
    };
  }

  /**
   * 微信支付回调通知处理
   *
   * 工作流程：
   * 1. 用户完成支付后，微信服务器会主动POST通知到此端点
   * 2. 后端验证回调签名确保数据来自微信
   * 3. 更新订单支付状态为"已支付"
   * 4. 返回XML格式的确认信息给微信（必须在5秒内返回）
   *
   * 重要：这个端点必须能被微信公网访问
   * 回调内容使用XML格式：
   * <xml>
   *   <return_code>SUCCESS</return_code>
   *   <appid>...</appid>
   *   <mch_id>...</mch_id>
   *   <out_trade_no>商户订单号</out_trade_no>
   *   <transaction_id>微信交易号</transaction_id>
   *   <total_fee>支付金额（分）</total_fee>
   *   <sign>签名</sign>
   * </xml>
   */
  @Post('callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Handle WeChat payment callback',
    description:
      'Process WeChat payment callback notification. Must be publicly accessible. Verify signature and update order status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Callback processed successfully',
  })
  async handleCallback(
    @Body() callbackData: WechatPaymentCallbackDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      this.logger.log(
        `Received payment callback for trade: ${callbackData.out_trade_no}`,
      );

      // 处理回调
      await this.wechatPaymentService.handlePaymentCallback(callbackData);

      // 返回XML格式的成功响应（微信规定必须返回这种格式）
      const response = `<xml>
        <return_code><![CDATA[SUCCESS]]></return_code>
        <return_msg><![CDATA[OK]]></return_msg>
      </xml>`;

      res.type('text/xml').send(response);
    } catch (error) {
      this.logger.error(`Payment callback error: ${error.message}`);

      // 返回XML格式的失败响应
      const response = `<xml>
        <return_code><![CDATA[FAIL]]></return_code>
        <return_msg><![CDATA[${error.message}]]></return_msg>
      </xml>`;

      res.type('text/xml').send(response);
    }
  }

  /**
   * 查询订单支付状态
   * 小程序可以调用此接口查询订单是否已支付
   */
  @Get('query-status')
  @ApiOperation({
    summary: 'Query payment order status',
    description: 'Query if a payment order has been paid',
  })
  @ApiQuery({
    name: 'tradeNo',
    description: 'Trade number (商户订单号)',
    example: 'ORD20231225001',
  })
  @ApiQuery({
    name: 'openid',
    description: 'User openId',
    example: 'oT8sGv0dAZWqB5jq7V_d-RM34xY8',
  })
  @ApiResponse({
    status: 200,
    description: 'Order status retrieved successfully',
    type: OrderStatusResponseDto,
  })
  async queryOrderStatus(
    @Query('tradeNo') tradeNo: string,
    @Query('openid') openid: string,
  ): Promise<{ code: number; message: string; data: OrderStatusResponseDto }> {
    const data = await this.wechatPaymentService.queryOrderStatus({
      tradeNo,
      openid,
    });

    return {
      code: 200,
      message: 'Order status retrieved successfully',
      data,
    };
  }

  /**
   * 发起退款
   * 商家可以调用此接口对已支付的订单进行退款
   *
   * 退款限制：
   * - 只能退款已成功支付的订单
   * - 退款金额不能超过原支付金额
   * - 退款操作需要验证用户身份
   */
  @Post('refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request refund',
    description:
      'Request refund for a paid order. Only refund orders with successful payment.',
  })
  @ApiResponse({
    status: 200,
    description: 'Refund request created successfully',
    type: RefundResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Order not found or refund not allowed',
  })
  async createRefund(
    @Body() refundDto: RefundRequestDto,
  ): Promise<{ code: number; message: string; data: RefundResponseDto }> {
    this.logger.log(
      `Creating refund for trade: ${refundDto.outTradeNo}, amount: ${refundDto.refundFee}`,
    );

    const data = await this.wechatPaymentService.createRefund(refundDto);

    return {
      code: 200,
      message: 'Refund request created successfully',
      data,
    };
  }
}
