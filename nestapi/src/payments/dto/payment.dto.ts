import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
  orderId: number;
  amount: number;
  paymentMethod?: PaymentMethod;
}

export class PaymentCallbackDto {
  transactionId: string; // 微信支付交易号
  outTradeNo: string;    // 商户订单号
  totalAmount: number;   // 支付金额
  tradeState: string;    // 交易状态
  tradeType: string;     // 交易类型
  bankType?: string;     // 银行类型
  attach?: string;       // 附加数据
  timeEnd: string;       // 支付完成时间
}

export class PaymentQueryDto {
  outTradeNo: string;
}
