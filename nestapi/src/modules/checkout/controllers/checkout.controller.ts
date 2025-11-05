import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CheckoutService } from '../services/checkout.service';
import { CheckoutDto } from '../dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('checkout')
@Controller('checkout')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  /**
   * Process checkout
   * Converts cart items to order and clears cart
   * POST /api/checkout
   */
  @Post()
  @ApiOperation({ summary: 'Process checkout and create order' })
  async checkout(@Request() req, @Body() checkoutDto: CheckoutDto) {
    return await this.checkoutService.checkout(req.user.id, checkoutDto);
  }

  /**
   * Get checkout summary without creating order
   * Useful for order preview before final checkout
   * POST /api/checkout/summary
   */
  @Post('summary')
  @ApiOperation({ summary: 'Get checkout summary (preview)' })
  async getCheckoutSummary(
    @Request() req,
    @Body() checkoutDto: CheckoutDto,
  ) {
    return await this.checkoutService.getCheckoutSummary(
      req.user.id,
      checkoutDto,
    );
  }

  /**
   * Validate checkout data before processing
   * POST /api/checkout/validate
   */
  @Post('validate')
  @ApiOperation({ summary: 'Validate checkout data' })
  async validateCheckout(
    @Request() req,
    @Body() checkoutDto: CheckoutDto,
  ) {
    return await this.checkoutService.validateCheckout(
      req.user.id,
      checkoutDto,
    );
  }

  /**
   * Get payment status for an order
   * Query order payment status by order number
   * GET /api/checkout/payment-status?orderNumber=ORD-1234567890-1234
   */
  @Get('payment-status')
  @ApiOperation({ summary: 'Get payment status for an order' })
  async getPaymentStatus(
    @Request() req,
    @Query('orderNumber') orderNumber: string,
  ) {
    return await this.checkoutService.getOrderPaymentStatus(
      req.user.id,
      orderNumber,
    );
  }
}
