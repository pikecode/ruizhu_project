import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { WishlistsService } from './wishlists.service';

@Controller('wishlist')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  async getWishlist() {
    // In a real scenario, extract user ID from JWT token
    const userId = 1; // TODO: Get from CurrentUser decorator
    return this.wishlistsService.getWishlist(userId);
  }

  @Post('add')
  async addToWishlist(@Body('productId') productId: number) {
    const userId = 1; // TODO: Get from CurrentUser decorator
    return this.wishlistsService.addToWishlist(userId, productId);
  }

  @Delete(':productId')
  async removeFromWishlist(@Param('productId') productId: number) {
    const userId = 1; // TODO: Get from CurrentUser decorator
    await this.wishlistsService.removeFromWishlist(userId, productId);
    return { message: '已删除' };
  }
}
