import {
  Injectable,
  BadRequestException,
  NotFoundException,
  HttpException,
  HttpStatus,
  Optional,
} from '@nestjs/common';
import { CheckoutDto } from '../dto';
import { OrdersService } from '../../orders/services/orders.service';
import { CartService } from '../../cart/services/cart.service';
import { AddressesService } from '../../addresses/services/addresses.service';
import { WechatPaymentService } from '../../wechat/services/wechat-payment.service';
import { UsersService } from '../../../users/users.service';
import { Order } from '../../../entities/product.entity';
import { CreateUnifiedOrderDto, CreatePaymentResponseDto, OrderStatusResponseDto, QueryOrderStatusDto } from '../../wechat/dto/wechat-payment.dto';

/**
 * Checkout Service
 * Manages the complete checkout flow:
 * 1. Validate cart items and address
 * 2. Create order from cart items
 * 3. Initialize WeChat payment
 * 4. Clear cart after successful order
 */
@Injectable()
export class CheckoutService {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly cartService: CartService,
    private readonly addressesService: AddressesService,
    @Optional() private readonly wechatPaymentService: WechatPaymentService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Process checkout: validate data, create order, initialize WeChat payment, clear cart
   * @param userId User ID
   * @param checkoutDto Checkout request with items and address ID
   * @returns Order details with WeChat payment information for client
   * @throws BadRequestException if validation fails
   * @throws NotFoundException if address or user not found
   */
  async checkout(
    userId: number,
    checkoutDto: CheckoutDto,
  ): Promise<{
    order: Order;
    payment: CreatePaymentResponseDto;
  }> {
    // Validate input
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    if (!checkoutDto.items || checkoutDto.items.length === 0) {
      throw new BadRequestException('At least one item is required');
    }

    // Validate address exists and belongs to user
    const address = await this.addressesService.getAddress(
      userId,
      checkoutDto.addressId,
    );

    if (!address) {
      throw new NotFoundException(
        `Address with ID ${checkoutDto.addressId} not found`,
      );
    }

    // Calculate total amount from items
    let totalAmount = 0;
    for (const item of checkoutDto.items) {
      const itemTotal = item.price * item.quantity;
      totalAmount += itemTotal;
    }

    // Create order with the validated data
    const finalAmount = Math.max(0, totalAmount + (checkoutDto.shippingAmount || 0) - (checkoutDto.discountAmount || 0));
    const order = await this.ordersService.createOrder(userId, {
      items: checkoutDto.items,
      addressId: checkoutDto.addressId,
      totalAmount,
      shippingAmount: checkoutDto.shippingAmount || 0,
      discountAmount: checkoutDto.discountAmount || 0,
      finalAmount,
      remark: checkoutDto.remark,
    });

    // Get user's openId for WeChat payment initialization
    const user = await this.usersService.findOne(userId);
    if (!user || !user.openId) {
      throw new BadRequestException(
        'User WeChat openId not found. Please authorize with WeChat first.',
      );
    }

    // Initialize WeChat payment
    if (!this.wechatPaymentService) {
      throw new HttpException(
        'WeChat payment service is not available. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const paymentInfo = await this.wechatPaymentService.createUnifiedOrder({
      openid: user.openId,
      outTradeNo: order.orderNo,
      totalFee: order.totalAmount * 100, // 转换为分（元 -> 分）
      body: '购物订单',
      detail: checkoutDto.items
        .map((item) => `商品ID:${item.productId} 数量:${item.quantity}`)
        .join('|'),
      metadata: {
        orderId: order.id,
        userId: userId,
      },
      remark: checkoutDto.remark,
    });

    // Clear cart after successful order creation
    try {
      await this.cartService.clearCart(userId);
    } catch (error) {
      // Log error but don't fail checkout if cart clear fails
      console.error('Error clearing cart after checkout:', error);
    }

    return {
      order,
      payment: paymentInfo,
    };
  }

  /**
   * Get checkout summary without creating order
   * Useful for preview before checkout
   * @param userId User ID
   * @param checkoutDto Checkout request
   * @returns Checkout summary with totals
   */
  async getCheckoutSummary(
    userId: number,
    checkoutDto: CheckoutDto,
  ): Promise<{
    itemCount: number;
    subtotal: number; // Items total
    shippingAmount: number;
    discountAmount: number;
    totalAmount: number; // Final amount to pay
    addressId: number;
    canCheckout: boolean; // Whether checkout is allowed
    validationError?: string; // If canCheckout is false
  }> {
    // Check if user has valid address
    try {
      await this.addressesService.getAddress(userId, checkoutDto.addressId);
    } catch {
      return {
        itemCount: checkoutDto.items.length,
        subtotal: 0,
        shippingAmount: 0,
        discountAmount: 0,
        totalAmount: 0,
        addressId: checkoutDto.addressId,
        canCheckout: false,
        validationError: `Address ${checkoutDto.addressId} not found for user`,
      };
    }

    // Calculate totals
    let subtotal = 0;
    let itemCount = 0;

    for (const item of checkoutDto.items) {
      if (item.quantity > 0) {
        subtotal += item.price * item.quantity;
        itemCount += item.quantity;
      }
    }

    const shippingAmount = checkoutDto.shippingAmount || 0;
    const discountAmount = checkoutDto.discountAmount || 0;
    const totalAmount = Math.max(0, subtotal + shippingAmount - discountAmount);

    return {
      itemCount,
      subtotal,
      shippingAmount,
      discountAmount,
      totalAmount,
      addressId: checkoutDto.addressId,
      canCheckout: true,
    };
  }

  /**
   * Validate checkout before processing
   * @param userId User ID
   * @param checkoutDto Checkout request
   * @returns Validation result with any errors
   */
  async validateCheckout(
    userId: number,
    checkoutDto: CheckoutDto,
  ): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    // Validate items
    if (!checkoutDto.items || checkoutDto.items.length === 0) {
      errors.push('At least one item is required');
    }

    for (const item of checkoutDto.items) {
      if (!item.productId || item.productId <= 0) {
        errors.push(`Invalid productId: ${item.productId}`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Invalid quantity for product ${item.productId}`);
      }
      if (!item.price || item.price < 0) {
        errors.push(`Invalid price for product ${item.productId}`);
      }
    }

    // Validate address
    try {
      await this.addressesService.getAddress(userId, checkoutDto.addressId);
    } catch {
      errors.push(
        `Address ${checkoutDto.addressId} not found or does not belong to user`,
      );
    }

    // Validate amounts
    if (checkoutDto.shippingAmount && checkoutDto.shippingAmount < 0) {
      errors.push('Shipping amount cannot be negative');
    }
    if (checkoutDto.discountAmount && checkoutDto.discountAmount < 0) {
      errors.push('Discount amount cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Query payment status for an order by order number
   * @param userId User ID
   * @param orderNumber Order number (used as outTradeNo in payment)
   * @returns Payment status information
   */
  async getOrderPaymentStatus(
    userId: number,
    orderNumber: string,
  ): Promise<OrderStatusResponseDto> {
    // Validate input
    if (!userId || !orderNumber) {
      throw new BadRequestException('User ID and order number are required');
    }

    // Query payment status from WeChat payment service
    // Note: The user's openId should be retrieved from the user context
    // For now, we'll retrieve it from the database
    const user = await this.usersService.findOne(userId);
    if (!user || !user.openId) {
      throw new BadRequestException(
        'User WeChat openId not found. Please authorize with WeChat first.',
      );
    }

    // Check if WeChat payment service is available
    if (!this.wechatPaymentService) {
      throw new HttpException(
        'WeChat payment service is not available. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    // Query order status
    return await this.wechatPaymentService.queryOrderStatus({
      tradeNo: orderNumber,
      openid: user.openId,
    });
  }
}
