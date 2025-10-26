import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistsRepository: Repository<Wishlist>,
    @InjectRepository(WishlistItem)
    private wishlistItemsRepository: Repository<WishlistItem>,
  ) {}

  async getOrCreateWishlist(userId: number): Promise<Wishlist> {
    let wishlist = await this.wishlistsRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });

    if (!wishlist) {
      wishlist = this.wishlistsRepository.create({ userId });
      wishlist = await this.wishlistsRepository.save(wishlist);
    }

    return wishlist;
  }

  async addToWishlist(userId: number, productId: number) {
    const wishlist = await this.getOrCreateWishlist(userId);

    const existingItem = await this.wishlistItemsRepository.findOne({
      where: { wishlistId: wishlist.id, productId },
    });

    if (existingItem) {
      throw new BadRequestException('产品已在愿望清单中');
    }

    const item = this.wishlistItemsRepository.create({
      wishlist,
      productId,
    });

    return await this.wishlistItemsRepository.save(item);
  }

  async removeFromWishlist(userId: number, productId: number) {
    const wishlist = await this.getOrCreateWishlist(userId);

    const item = await this.wishlistItemsRepository.findOne({
      where: { wishlistId: wishlist.id, productId },
    });

    if (!item) {
      throw new NotFoundException('愿望清单项不存在');
    }

    await this.wishlistItemsRepository.remove(item);
  }

  async getWishlist(userId: number) {
    return await this.getOrCreateWishlist(userId);
  }
}
