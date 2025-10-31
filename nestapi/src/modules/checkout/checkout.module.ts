import { Module } from '@nestjs/common';
import { CheckoutService } from './services/checkout.service';
import { CheckoutController } from './controllers/checkout.controller';
import { OrdersModule } from '../orders/orders.module';
import { CartModule } from '../cart/cart.module';
import { AddressesModule } from '../addresses/addresses.module';
import { WechatModule } from '../wechat/wechat.module';
import { UsersModule } from '../../users/users.module';

/**
 * Checkout Module
 * Orchestrates the checkout process:
 * - Integrates Cart, Orders, Addresses, Users, and WeChat Payment modules
 * - Validates checkout data
 * - Creates orders and initializes payment
 * - Provides checkout preview and validation endpoints
 */
@Module({
  imports: [OrdersModule, CartModule, AddressesModule, WechatModule, UsersModule],
  providers: [CheckoutService],
  controllers: [CheckoutController],
  exports: [CheckoutService],
})
export class CheckoutModule {}
