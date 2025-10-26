import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { CouponsService } from './coupons.service';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('validate')
  async validateCoupon(
    @Body() body: { code: string; orderAmount: number },
  ) {
    return this.couponsService.validateCoupon(body.code, body.orderAmount);
  }

  @Get('available')
  async getAvailableCoupons(@Query('orderAmount') orderAmount: number) {
    return this.couponsService.getAvailableCoupons(orderAmount);
  }
}
