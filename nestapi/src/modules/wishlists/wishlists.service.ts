import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Wishlist } from '../../entities/wishlist.entity'
import { Product } from '../../entities/product.entity'

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>
  ) {}

  /**
   * 添加产品到心愿单
   */
  async addToWishlist(userId: number, productId: number): Promise<Wishlist> {
    // 检查产品是否存在
    const product = await this.productRepository.findOne({
      where: { id: productId }
    })

    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`)
    }

    // 检查是否已添加到心愿单
    const existing = await this.wishlistRepository.findOne({
      where: {
        userId,
        productId
      }
    })

    if (existing) {
      throw new ConflictException('Product already in wishlist')
    }

    // 添加到心愿单
    const wishlist = this.wishlistRepository.create({
      userId,
      productId
    })

    return await this.wishlistRepository.save(wishlist)
  }

  /**
   * 从心愿单删除产品
   */
  async removeFromWishlist(userId: number, productId: number): Promise<void> {
    const result = await this.wishlistRepository.delete({
      userId,
      productId
    })

    if (result.affected === 0) {
      throw new NotFoundException(
        `Wishlist item with productId ${productId} not found`
      )
    }
  }

  /**
   * 获取用户的心愿单列表
   */
  async getWishlist(userId: number, skip = 0, take = 20) {
    const [items, total] = await this.wishlistRepository.findAndCount({
      where: { userId },
      relations: ['product'],
      skip,
      take,
      order: { createdAt: 'DESC' }
    })

    return {
      items,
      total,
      page: Math.floor(skip / take) + 1,
      totalPages: Math.ceil(total / take)
    }
  }

  /**
   * 检查产品是否在心愿单中
   */
  async isInWishlist(userId: number, productId: number): Promise<boolean> {
    const count = await this.wishlistRepository.count({
      where: {
        userId,
        productId
      }
    })

    return count > 0
  }

  /**
   * 批量检查产品是否在心愿单中
   */
  async checkMultipleWishlists(
    userId: number,
    productIds: number[]
  ): Promise<Record<number, boolean>> {
    const wishlisted = await this.wishlistRepository.find({
      where: {
        userId,
        productId: productIds as any
      },
      select: ['productId']
    })

    const wishlistedSet = new Set(wishlisted.map(w => w.productId))

    const result: Record<number, boolean> = {}
    productIds.forEach(id => {
      result[id] = wishlistedSet.has(id)
    })

    return result
  }

  /**
   * 清空用户的心愿单
   */
  async clearWishlist(userId: number): Promise<void> {
    await this.wishlistRepository.delete({ userId })
  }
}
