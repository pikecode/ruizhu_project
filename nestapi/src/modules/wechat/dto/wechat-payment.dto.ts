import { IsString, IsNotEmpty, IsNumber, IsOptional, IsJSON } from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';

/**
 * 创建统一下单请求 DTO
 * 调用微信统一下单 API 创建预付订单
 */
export class CreateUnifiedOrderDto {
  @ApiProperty({
    description: '用户openId',
    example: 'oT8sGv0dAZWqB5jq7V_d-RM34xY8',
  })
  @IsString()
  @IsNotEmpty()
  openid: string;

  @ApiProperty({
    description: '商户订单号，需要在商户系统中唯一',
    example: 'ORD20231225001',
  })
  @IsString()
  @IsNotEmpty()
  outTradeNo: string;

  @ApiProperty({
    description: '支付金额（分），最小为1',
    example: 100,
  })
  @IsNumber()
  @IsNotEmpty()
  totalFee: number;

  @ApiProperty({
    description: '商品描述',
    example: '商城购物',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({
    description: '商品详情（可选）',
    example: '商品ID:123456 数量:2',
    required: false,
  })
  @IsString()
  @IsOptional()
  detail?: string;

  @ApiProperty({
    description: '商品标签（可选）',
    example: 'goods',
    required: false,
  })
  @IsString()
  @IsOptional()
  goodsTag?: string;

  @ApiProperty({
    description: '业务数据（JSON格式，可选），用于存储额外信息',
    example: { orderId: 123, userId: 456 },
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({
    description: '备注（可选）',
    example: '测试订单',
    required: false,
  })
  @IsString()
  @IsOptional()
  remark?: string;
}

/**
 * 微信统一下单 API 响应 DTO
 */
export class UnifiedOrderResponseDto {
  @ApiProperty({
    description: '返回码',
    example: 'SUCCESS',
  })
  return_code: string;

  @ApiProperty({
    description: '返回信息',
    example: 'OK',
  })
  return_msg: string;

  @ApiProperty({
    description: '业务结果码',
    example: 'SUCCESS',
    required: false,
  })
  result_code?: string;

  @ApiProperty({
    description: '预付交易会话标识',
    example: 'wx201512122015105a27612ec7cef79291',
  })
  prepay_id?: string;

  @ApiProperty({
    description: '二维码链接',
    example: 'weixin://wxpay/bizpayurl?pr=...',
    required: false,
  })
  code_url?: string;
}

/**
 * 创建支付订单响应 DTO
 * 返回给小程序客户端的响应
 */
export class CreatePaymentResponseDto {
  @ApiProperty({
    description: '商户订单号',
    example: 'ORD20231225001',
  })
  outTradeNo: string;

  @ApiProperty({
    description: '预付交易会话标识',
    example: 'wx201512122015105a27612ec7cef79291',
  })
  prepayId: string;

  @ApiProperty({
    description: '支付时间戳',
    example: '1640000000',
  })
  timeStamp: string;

  @ApiProperty({
    description: '随机字符串',
    example: 'abc123',
  })
  nonceStr: string;

  @ApiProperty({
    description: '签名方式',
    example: 'MD5',
  })
  signType: string;

  @ApiProperty({
    description: '支付签名',
    example: 'xxx...',
  })
  paySign: string;

  @ApiProperty({
    description: '支付金额（分）',
    example: 100,
  })
  totalFee: number;

  @ApiProperty({
    description: '商品描述',
    example: '商城购物',
  })
  body: string;
}

/**
 * 微信支付回调数据 DTO
 * 微信服务器会以此格式向商家服务器发送回调
 */
export class WechatPaymentCallbackDto {
  appid: string;
  mch_id: string;
  nonce_str: string;
  sign: string;
  result_code: string;
  prepay_id?: string;
  openid?: string;
  trade_type?: string;
  bank_type?: string;
  total_fee?: number;
  spbill_create_ip?: string;
  gmt_create?: string;
  gmt_payment?: string;
  transaction_id?: string;
  out_trade_no?: string;
  attach?: string;
  time_end?: string;
  trade_state?: string;
  trade_state_desc?: string;
  err_code?: string;
  err_code_des?: string;

  [key: string]: any;
}

/**
 * 查询订单状态 DTO
 */
export class QueryOrderStatusDto {
  @ApiProperty({
    description: '商户订单号或微信交易号',
    example: 'ORD20231225001',
  })
  @IsString()
  @IsNotEmpty()
  tradeNo: string;

  @ApiProperty({
    description: '用户openId',
    example: 'oT8sGv0dAZWqB5jq7V_d-RM34xY8',
  })
  @IsString()
  @IsNotEmpty()
  openid: string;
}

/**
 * 订单状态响应 DTO
 */
export class OrderStatusResponseDto {
  @ApiProperty({
    description: '订单号',
    example: 'ORD20231225001',
  })
  outTradeNo: string;

  @ApiProperty({
    description: '支付状态',
    enum: ['pending', 'success', 'failed', 'cancelled'],
  })
  status: string;

  @ApiProperty({
    description: '支付金额（分）',
    example: 100,
  })
  totalFee: number;

  @ApiProperty({
    description: '支付完成时间',
    example: '2023-12-25T10:00:00Z',
    required: false,
  })
  payTime?: Date;

  @ApiProperty({
    description: '微信交易号',
    example: '1234567890',
    required: false,
  })
  transactionId?: string;
}

/**
 * 退款请求 DTO
 */
export class RefundRequestDto {
  @ApiProperty({
    description: '商户订单号',
    example: 'ORD20231225001',
  })
  @IsString()
  @IsNotEmpty()
  outTradeNo: string;

  @ApiProperty({
    description: '退款金额（分），为空则全额退款',
    example: 50,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  refundFee?: number;

  @ApiProperty({
    description: '退款原因',
    example: '用户申请退款',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    description: '用户openId',
    example: 'oT8sGv0dAZWqB5jq7V_d-RM34xY8',
  })
  @IsString()
  @IsNotEmpty()
  openid: string;
}

/**
 * 退款响应 DTO
 */
export class RefundResponseDto {
  @ApiProperty({
    description: '商户订单号',
    example: 'ORD20231225001',
  })
  outTradeNo: string;

  @ApiProperty({
    description: '退款状态',
    enum: ['processing', 'success', 'failed'],
  })
  status: string;

  @ApiProperty({
    description: '退款金额（分）',
    example: 50,
  })
  refundFee: number;

  @ApiProperty({
    description: '微信退款单号',
    example: '50000000382018062301',
    required: false,
  })
  refundId?: string;
}
