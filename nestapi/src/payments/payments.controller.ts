import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { WechatPayService } from './wechat-pay.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { CreateWechatPayDto } from './dto/wechat-pay.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly wechatPayService: WechatPayService,
  ) {}

  /**
   * 创建支付订单
   */
  @Post('create')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async createPayment(
    @CurrentUser() user: any,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    try {
      const payment = await this.paymentsService.createPayment(
        user.id,
        createPaymentDto,
      );

      return {
        statusCode: HttpStatus.OK,
        message: '支付订单创建成功',
        data: payment,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || '创建支付订单失败',
        data: null,
      };
    }
  }

  /**
   * 微信支付回调
   * 注意：这个接口不需要JWT认证，因为是来自微信服务器的回调
   */
  @Post('wechat/callback')
  @HttpCode(HttpStatus.OK)
  async handleWechatCallback(@Req() req: RawBodyRequest<Request>) {
    try {
      // 解析XML或JSON回调数据
      let callbackData;

      if (typeof req.body === 'string') {
        // 如果是XML，需要解析
        callbackData = JSON.parse(req.body);
      } else {
        callbackData = req.body;
      }

      // 处理回调
      const result = await this.paymentsService.handleWechatCallback(callbackData);

      // 返回成功响应
      return {
        statusCode: HttpStatus.OK,
        message: '回调处理成功',
        data: result,
      };
    } catch (error) {
      console.error('微信支付回调处理失败:', error);
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: '回调处理失败: ' + error.message,
        data: null,
      };
    }
  }

  /**
   * 查询支付状态
   */
  @Get(':transactionNo')
  @UseGuards(JwtGuard)
  async queryPaymentStatus(@Param('transactionNo') transactionNo: string) {
    try {
      const payment = await this.paymentsService.queryPaymentStatus(transactionNo);

      return {
        statusCode: HttpStatus.OK,
        message: '查询成功',
        data: payment,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: error.message || '查询失败',
        data: null,
      };
    }
  }

  /**
   * 获取支付详情
   */
  @Get('detail/:id')
  @UseGuards(JwtGuard)
  async getPaymentDetail(@Param('id') id: string) {
    try {
      const payment = await this.paymentsService.getPayment(+id);

      if (!payment) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: '支付记录不存在',
          data: null,
        };
      }

      return {
        statusCode: HttpStatus.OK,
        message: '获取成功',
        data: payment,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: '获取失败',
        data: null,
      };
    }
  }

  /**
   * 获取订单的支付记录
   */
  @Get('order/:orderId')
  @UseGuards(JwtGuard)
  async getPaymentByOrderId(@Param('orderId') orderId: string) {
    try {
      const payment = await this.paymentsService.getPaymentByOrderId(+orderId);

      if (!payment) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: '该订单尚无支付记录',
          data: null,
        };
      }

      return {
        statusCode: HttpStatus.OK,
        message: '获取成功',
        data: payment,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: '获取失败',
        data: null,
      };
    }
  }

  /**
   * 创建微信JSAPI支付
   */
  @Post('wechat/jsapi')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async createWechatJSAPIPayment(
    @CurrentUser() user: any,
    @Body() createWechatPayDto: CreateWechatPayDto,
  ) {
    try {
      const paymentParams = await this.wechatPayService.createPayment(
        user.id,
        createWechatPayDto,
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: '微信支付订单创建成功',
        data: paymentParams,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || '创建微信支付订单失败',
        data: null,
      };
    }
  }

  /**
   * 微信V3回调处理
   * 微信服务器会在支付完成后调用此接口
   */
  @Post('wechat/v3-callback')
  @HttpCode(HttpStatus.OK)
  async handleWechatV3Callback(@Req() req: RawBodyRequest<Request>) {
    try {
      const callbackData = req.body;

      await this.wechatPayService.handleCallback(callbackData);

      return {
        code: 'SUCCESS',
        message: '成功',
      };
    } catch (error) {
      console.error('微信支付V3回调处理失败:', error);
      return {
        code: 'FAIL',
        message: error.message,
      };
    }
  }

  /**
   * 查询微信支付状态
   */
  @Get('wechat/:outTradeNo/status')
  @UseGuards(JwtGuard)
  async getWechatPaymentStatus(
    @Param('outTradeNo') outTradeNo: string,
  ) {
    try {
      const paymentStatus =
        await this.wechatPayService.queryPaymentStatus(outTradeNo);

      return {
        statusCode: HttpStatus.OK,
        message: '查询成功',
        data: paymentStatus,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || '查询失败',
        data: null,
      };
    }
  }

  /**
   * 申请微信退款
   */
  @Post('wechat/refund')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async refundWechatPayment(
    @Body()
    refundData: {
      outTradeNo: string;
      outRefundNo: string;
      refundAmount: number;
      totalAmount: number;
    },
  ) {
    try {
      const refundResult = await this.wechatPayService.refund(
        refundData.outTradeNo,
        refundData.outRefundNo,
        refundData.refundAmount,
        refundData.totalAmount,
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: '退款申请已提交',
        data: refundResult,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || '退款申请失败',
        data: null,
      };
    }
  }
}
