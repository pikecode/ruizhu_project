import { Injectable, BadRequestException, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from '../entities/cart-item.entity';
import { Product } from '../../../entities/product.entity';
import { CreateCartItemDto, UpdateCartItemDto, CartItemResponseDto } from '../dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
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
      color: selectedAttributes?.color || '',
      size: selectedAttributes?.size || '',
      selected: false, // 初始化为未选中
    };
  }

  /**
   * Add item to user's shopping cart
   * 乐观更新策略：先加入购物车，如果库存不足则恢复原数量
   * 这样可以避免因购物车中已有商品而拒绝新增，提升用户体验
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

    // 验证产品是否存在和已售罄
    const product = await this.productRepository.findOne({
      where: { id: createDto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product ID ${createDto.productId} not found`);
    }

    if (product.stockStatus === 'soldOut') {
      throw new BadRequestException('产品已售罄，无法加入购物车');
    }

    // 保存原始数量用于回滚
    const originalQuantity = cartItem ? cartItem.quantity : 0;

    try {
      if (cartItem) {
        // 更新购物车项
        const newQuantity = cartItem.quantity + createDto.quantity;
        cartItem.quantity = newQuantity;
        if (createDto.selectedAttributes) {
          cartItem.selectedAttributes = createDto.selectedAttributes;
        }
        if (createDto.priceSnapshot) {
          cartItem.priceSnapshot = createDto.priceSnapshot;
        }
        cartItem = await this.cartItemRepository.save(cartItem);
      } else {
        // 创建新的购物车项
        cartItem = this.cartItemRepository.create({
          userId,
          productId: createDto.productId,
          quantity: createDto.quantity,
          selectedAttributes: createDto.selectedAttributes,
          priceSnapshot: createDto.priceSnapshot,
        });
        cartItem = await this.cartItemRepository.save(cartItem);

        // 重新加载关联产品信息
        const reloadedItem = await this.cartItemRepository.findOne({
          where: { id: cartItem.id },
          relations: ['product'],
        });
        if (reloadedItem) {
          cartItem = reloadedItem;
        }
      }

      // 验证库存：如果库存不足则回滚数量
      if (cartItem.product && cartItem.product.stockQuantity < cartItem.quantity) {
        // 恢复原始数量
        cartItem.quantity = originalQuantity;
        await this.cartItemRepository.save(cartItem);

        // 如果是新增商品且库存不足，删除购物车项
        if (originalQuantity === 0) {
          await this.cartItemRepository.delete({ id: cartItem.id });
          throw new HttpException(
            {
              code: 422,
              message: `库存不足，仅剩 ${cartItem.product.stockQuantity} 件，无法加入 ${createDto.quantity} 件`,
              errorType: 'INSUFFICIENT_STOCK',
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }

        // 如果是现有商品，静默失败（不增加数量）
        // 这样用户点击加入购物车多次也不会出现错误提示，购物车数量会保持不变
        return this.formatCartItemResponse(cartItem);
      }

      return this.formatCartItemResponse(cartItem);
    } catch (error) {
      // 发生错误时恢复原始数量
      if (cartItem && cartItem.id) {
        cartItem.quantity = originalQuantity;
        if (originalQuantity > 0) {
          await this.cartItemRepository.save(cartItem);
        } else {
          await this.cartItemRepository.delete({ id: cartItem.id });
        }
      }
      throw error;
    }
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

      // 库存验证：更新数量时检查库存
      if (cartItem.product && cartItem.product.stockQuantity < updateDto.quantity) {
        throw new HttpException(
          {
            code: 422,
            message: `库存不足，仅剩 ${cartItem.product.stockQuantity} 件，无法更新为 ${updateDto.quantity} 件`,
            errorType: 'INSUFFICIENT_STOCK',
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      if (cartItem.product && cartItem.product.stockStatus === 'soldOut') {
        throw new BadRequestException('产品已售罄，无法在购物车中修改数量');
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
