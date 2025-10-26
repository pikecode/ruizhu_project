import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/add-to-cart.dto';

@Controller('cart')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  async getCart() {
    // In a real scenario, extract user ID from JWT token
    // For now, we'll use a placeholder userId
    const userId = 1; // TODO: Get from CurrentUser decorator
    return this.cartsService.getCart(userId);
  }

  @Post('add')
  async addItem(@Body() addToCartDto: AddToCartDto) {
    const userId = 1; // TODO: Get from CurrentUser decorator
    return this.cartsService.addItem(userId, addToCartDto);
  }

  @Patch('items/:id')
  async updateItem(
    @Param('id') itemId: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    const userId = 1; // TODO: Get from CurrentUser decorator
    return this.cartsService.updateItem(userId, itemId, updateCartItemDto);
  }

  @Delete('items/:id')
  async removeItem(@Param('id') itemId: number) {
    const userId = 1; // TODO: Get from CurrentUser decorator
    await this.cartsService.removeItem(userId, itemId);
    return { message: '已删除' };
  }

  @Delete()
  async clearCart() {
    const userId = 1; // TODO: Get from CurrentUser decorator
    await this.cartsService.clearCart(userId);
    return { message: '购物车已清空' };
  }
}
