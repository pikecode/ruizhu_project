import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  Request,
  ParseIntPipe
} from '@nestjs/common'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { WishlistsService } from './wishlists.service'

@Controller('wishlists')
@UseGuards(JwtAuthGuard)
export class WishlistsController {
  constructor(private wishlistsService: WishlistsService) {}

  /**
   * 获取用户的心愿单列表
   */
  @Get()
  async getWishlist(
    @Request() req,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 20
  ) {
    if (page < 1) page = 1
    if (limit < 1 || limit > 100) limit = 20

    const skip = (page - 1) * limit

    const result = await this.wishlistsService.getWishlist(req.user.id, skip, limit)

    return {
      code: 200,
      message: 'Success',
      data: result
    }
  }

  /**
   * 检查多个产品是否在心愿单中
   */
  @Post('check')
  async checkWishlist(
    @Request() req,
    @Body('productIds') productIds: number[]
  ) {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      throw new BadRequestException('productIds must be a non-empty array')
    }

    const result = await this.wishlistsService.checkMultipleWishlists(
      req.user.id,
      productIds
    )

    return {
      code: 200,
      message: 'Success',
      data: result
    }
  }

  /**
   * 添加产品到心愿单
   */
  @Post()
  async addToWishlist(
    @Request() req,
    @Body('productId') productId: number
  ) {
    if (!productId) {
      throw new BadRequestException('productId is required')
    }

    return await this.wishlistsService.addToWishlist(req.user.id, productId)
  }

  /**
   * 从心愿单删除产品
   */
  @Delete(':productId')
  async removeFromWishlist(
    @Request() req,
    @Param('productId', ParseIntPipe) productId: number
  ) {
    if (!productId) {
      throw new BadRequestException('productId is required')
    }

    await this.wishlistsService.removeFromWishlist(req.user.id, productId)

    return { message: 'Product removed from wishlist' }
  }

  /**
   * 清空心愿单
   */
  @Delete()
  async clearWishlist(@Request() req) {
    await this.wishlistsService.clearWishlist(req.user.id)

    return { message: 'Wishlist cleared' }
  }
}
