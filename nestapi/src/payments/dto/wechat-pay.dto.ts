import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateWechatPayDto {
  @IsNumber()
  orderId: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class WechatPayCallbackDto {
  mchid: string;
  appid: string;
  out_trade_no: string;
  transaction_id: string;
  trade_type: string;
  trade_state: string;
  trade_state_desc: string;
  bank_type: string;
  attach: string;
  success_time: string;
  payer: {
    openid: string;
  };
  amount: {
    total: number;
    payer_total: number;
    currency: string;
    payer_currency: string;
  };
}

export class WechatPayResponseDto {
  appid: string;
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: string;
  paySign: string;
  prepay_id?: string;
}
