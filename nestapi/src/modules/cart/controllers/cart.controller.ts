import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartService } from '../services/cart.service';
import { CreateCartItemDto, UpdateCartItemDto } from '../dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Add item to cart
   * POST /api/cart
   *
   * Response includes product details:
   * - id: cart item ID
   * - productId: product ID
   * - name: product name (商品名称)
   * - image: product cover image URL (商品图片)
   * - price: product price in cents (商品价格，单位：分)
   * - quantity: quantity added to cart (数量)
   * - color: selected color (颜色)
   * - size: selected size (尺码)
   */
  @Post()
  @ApiOperation({ summary: 'Add item to cart' })
  async addToCart(@Request() req, @Body() createDto: CreateCartItemDto) {
    const data = await this.cartService.addToCart(req.user.id, createDto);
    return {
      code: 200,
      message: '商品已添加到购物车',
      data,
    };
  }

  /**
   * Get all items in user's cart with product details
   * GET /api/cart
   *
   * Response includes:
   * - id: cart item ID
   * - productId: product ID
   * - name: product name (商品名称)
   * - image: product cover image URL (商品图片)
   * - price: product price in cents (商品价格，单位：分)
   * - quantity: quantity in cart (数量)
   * - color: selected color (颜色)
   * - size: selected size (尺码)
   */
  @Get()
  @ApiOperation({ summary: 'Get all cart items with product details' })
  async getCart(@Request() req) {
    const data = await this.cartService.getCart(req.user.id);
    return {
      code: 200,
      message: '获取购物车成功',
      data,
    };
  }

  /**
   * Get cart summary (count and totals)
   * GET /api/cart/summary
   */
  @Get('summary')
  @ApiOperation({ summary: 'Get cart summary' })
  async getCartSummary(@Request() req) {
    return await this.cartService.getCartSummary(req.user.id);
  }

  /**
   * Get single cart item details
   * GET /api/cart/:itemId
   */
  @Get(':itemId')
  @ApiOperation({ summary: 'Get single cart item' })
  async getCartItem(
    @Request() req,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return await this.cartService.getCartItem(req.user.id, itemId);
  }

  /**
   * Update cart item quantity or attributes
   * PUT /api/cart/:itemId
   *
   * Response includes product details (name, image, price)
   */
  @Put(':itemId')
  @ApiOperation({ summary: 'Update cart item' })
  async updateCartItem(
    @Request() req,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateDto: UpdateCartItemDto,
  ) {
    const data = await this.cartService.updateCartItem(req.user.id, itemId, updateDto);
    return {
      code: 200,
      message: '购物车项更新成功',
      data,
    };
  }

  /**
   * Remove item from cart
   * DELETE /api/cart/:itemId
   */
  @Delete(':itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeFromCart(
    @Request() req,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    await this.cartService.removeFromCart(req.user.id, itemId);
    return { message: 'Item removed from cart' };
  }

  /**
   * Clear entire cart
   * DELETE /api/cart
   */
  @Delete()
  @ApiOperation({ summary: 'Clear entire cart' })
  async clearCart(@Request() req) {
    await this.cartService.clearCart(req.user.id);
    return { message: 'Cart cleared' };
  }

  /**
   * Remove multiple items from cart
   * POST /api/cart/clear-items
   * Body: { itemIds: number[] }
   */
  @Post('clear-items')
  @ApiOperation({ summary: 'Remove multiple items from cart' })
  async clearCartItems(
    @Request() req,
    @Body() { itemIds }: { itemIds: number[] },
  ) {
    await this.cartService.clearCartItems(req.user.id, itemIds);
    return { message: 'Selected items removed from cart' };
  }
}
