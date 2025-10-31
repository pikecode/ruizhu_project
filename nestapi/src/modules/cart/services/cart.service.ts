import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from '../entities/cart-item.entity';
import { CreateCartItemDto, UpdateCartItemDto } from '../dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  /**
   * Add item to user's shopping cart
   * If item already exists, update quantity
   */
  async addToCart(userId: number, createDto: CreateCartItemDto): Promise<CartItem> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    if (createDto.quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    // Check if item already exists in cart
    const existingItem = await this.cartItemRepository.findOne({
      where: {
        userId,
        productId: createDto.productId,
      },
    });

    if (existingItem) {
      // Update quantity if item already exists
      existingItem.quantity += createDto.quantity;
      if (createDto.selectedAttributes) {
        existingItem.selectedAttributes = createDto.selectedAttributes;
      }
      if (createDto.priceSnapshot) {
        existingItem.priceSnapshot = createDto.priceSnapshot;
      }
      return await this.cartItemRepository.save(existingItem);
    }

    // Create new cart item
    const cartItem = this.cartItemRepository.create({
      userId,
      productId: createDto.productId,
      quantity: createDto.quantity,
      selectedAttributes: createDto.selectedAttributes,
      priceSnapshot: createDto.priceSnapshot,
    });

    return await this.cartItemRepository.save(cartItem);
  }

  /**
   * Update cart item quantity or attributes
   */
  async updateCartItem(
    userId: number,
    cartItemId: number,
    updateDto: UpdateCartItemDto,
  ): Promise<CartItem> {
    const cartItem = await this.cartItemRepository.findOne({
      where: {
        id: cartItemId,
        userId,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (updateDto.quantity !== undefined) {
      if (updateDto.quantity < 1) {
        throw new BadRequestException('Quantity must be at least 1');
      }
      cartItem.quantity = updateDto.quantity;
    }

    if (updateDto.selectedAttributes !== undefined) {
      cartItem.selectedAttributes = updateDto.selectedAttributes;
    }

    return await this.cartItemRepository.save(cartItem);
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(userId: number, cartItemId: number): Promise<void> {
    const result = await this.cartItemRepository.delete({
      id: cartItemId,
      userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Cart item not found');
    }
  }

  /**
   * Get all items in user's cart
   */
  async getCart(userId: number): Promise<CartItem[]> {
    return await this.cartItemRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get single cart item details
   */
  async getCartItem(userId: number, cartItemId: number): Promise<CartItem> {
    const cartItem = await this.cartItemRepository.findOne({
      where: {
        id: cartItemId,
        userId,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    return cartItem;
  }

  /**
   * Clear entire cart for a user
   */
  async clearCart(userId: number): Promise<void> {
    await this.cartItemRepository.delete({ userId });
  }

  /**
   * Clear specific items from cart
   */
  async clearCartItems(userId: number, cartItemIds: number[]): Promise<void> {
    await this.cartItemRepository.delete({
      id: cartItemIds as any,
      userId,
    });
  }

  /**
   * Get cart summary (count and total)
   */
  async getCartSummary(userId: number): Promise<{
    itemCount: number;
    totalItems: number;
  }> {
    const items = await this.cartItemRepository.find({
      where: { userId },
    });

    return {
      itemCount: items.length,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }
}
