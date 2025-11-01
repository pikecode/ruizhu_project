import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException
} from '@nestjs/common'
import { JwtAuthGuard } from '../../guards/jwt-auth.guard'
import { CurrentUser } from '../../decorators/current-user.decorator'
import { WishlistsService } from './wishlists.service'
import { User } from '../../entities/user.entity'

@Controller('wishlists')
@UseGuards(JwtAuthGuard)
export class WishlistsController {
  constructor(private wishlistsService: WishlistsService) {}

  /**
   * 获取用户的心愿单列表
   */
  @Get()
  async getWishlist(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    if (page < 1) page = 1
    if (limit < 1 || limit > 100) limit = 20

    const skip = (page - 1) * limit

    return await this.wishlistsService.getWishlist(user.id, skip, limit)
  }

  /**
   * 检查多个产品是否在心愿单中
   */
  @Post('check')
  async checkWishlist(
    @CurrentUser() user: User,
    @Body('productIds') productIds: number[]
  ) {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      throw new BadRequestException('productIds must be a non-empty array')
    }

    return await this.wishlistsService.checkMultipleWishlists(
      user.id,
      productIds
    )
  }

  /**
   * 添加产品到心愿单
   */
  @Post()
  async addToWishlist(
    @CurrentUser() user: User,
    @Body('productId') productId: number
  ) {
    if (!productId) {
      throw new BadRequestException('productId is required')
    }

    return await this.wishlistsService.addToWishlist(user.id, productId)
  }

  /**
   * 从心愿单删除产品
   */
  @Delete(':productId')
  async removeFromWishlist(
    @CurrentUser() user: User,
    @Param('productId') productId: number
  ) {
    if (!productId) {
      throw new BadRequestException('productId is required')
    }

    await this.wishlistsService.removeFromWishlist(user.id, productId)

    return { message: 'Product removed from wishlist' }
  }

  /**
   * 清空心愿单
   */
  @Delete()
  async clearWishlist(@CurrentUser() user: User) {
    await this.wishlistsService.clearWishlist(user.id)

    return { message: 'Wishlist cleared' }
  }
}
