import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from '../entities/cart-item.entity';
import { CreateCartItemDto, UpdateCartItemDto, CartItemResponseDto } from '../dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  /**
   * 将 CartItem 转换为响应 DTO（包含产品信息）
   */
  private formatCartItemResponse(cartItem: CartItem): CartItemResponseDto {
    const selectedAttributes = cartItem.selectedAttributes || {};

    return {
      id: cartItem.id,
      productId: cartItem.productId,
      name: cartItem.product?.name || '',
      image: cartItem.product?.coverImageUrl || '',
      // 优先使用快照价格，如果没有则使用当前产品价格
      price: cartItem.priceSnapshot || cartItem.product?.currentPrice || 0,
      quantity: cartItem.quantity,
      color: selectedAttributes.color || '',
      size: selectedAttributes.size || '',
      selected: false, // 初始化为未选中
    };
  }

  /**
   * Add item to user's shopping cart
   * If item already exists, update quantity
   * Returns formatted cart item with product details
   */
  async addToCart(userId: number, createDto: CreateCartItemDto): Promise<CartItemResponseDto> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    if (createDto.quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    // Check if item already exists in cart
    let cartItem = await this.cartItemRepository.findOne({
      where: {
        userId,
        productId: createDto.productId,
      },
      relations: ['product'],
    });

    if (cartItem) {
      // Update quantity if item already exists
      cartItem.quantity += createDto.quantity;
      if (createDto.selectedAttributes) {
        cartItem.selectedAttributes = createDto.selectedAttributes;
      }
      if (createDto.priceSnapshot) {
        cartItem.priceSnapshot = createDto.priceSnapshot;
      }
      cartItem = await this.cartItemRepository.save(cartItem);
    } else {
      // Create new cart item
      cartItem = this.cartItemRepository.create({
        userId,
        productId: createDto.productId,
        quantity: createDto.quantity,
        selectedAttributes: createDto.selectedAttributes,
        priceSnapshot: createDto.priceSnapshot,
      });
      cartItem = await this.cartItemRepository.save(cartItem);

      // Reload with product relation
      const reloadedItem = await this.cartItemRepository.findOne({
        where: { id: cartItem.id },
        relations: ['product'],
      });
      if (reloadedItem) {
        cartItem = reloadedItem;
      }
    }

    return this.formatCartItemResponse(cartItem);
  }

  /**
   * Update cart item quantity or attributes
   * Returns formatted cart item with product details
   */
  async updateCartItem(
    userId: number,
    cartItemId: number,
    updateDto: UpdateCartItemDto,
  ): Promise<CartItemResponseDto> {
    let cartItem = await this.cartItemRepository.findOne({
      where: {
        id: cartItemId,
        userId,
      },
      relations: ['product'],
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

    cartItem = await this.cartItemRepository.save(cartItem);
    return this.formatCartItemResponse(cartItem);
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
   * Get all items in user's cart with product details (formatted)
   */
  async getCart(userId: number): Promise<CartItemResponseDto[]> {
    const cartItems = await this.cartItemRepository.find({
      where: { userId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });

    return cartItems.map(item => this.formatCartItemResponse(item));
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
