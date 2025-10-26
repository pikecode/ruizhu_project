import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { WechatPayService } from './wechat-pay.service';
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Payment, Order]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, WechatPayService],
  exports: [PaymentsService, WechatPayService],
})
export class PaymentsModule {}
