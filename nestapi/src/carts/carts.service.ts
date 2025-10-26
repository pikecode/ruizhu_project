import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { AddToCartDto, UpdateCartItemDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemsRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async getOrCreateCart(userId: number): Promise<Cart> {
    let cart = await this.cartsRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartsRepository.create({ userId });
      cart = await this.cartsRepository.save(cart);
    }

    return cart;
  }

  async addItem(userId: number, addToCartDto: AddToCartDto): Promise<CartItem> {
    const cart = await this.getOrCreateCart(userId);
    const product = await this.productsRepository.findOne({
      where: { id: addToCartDto.productId },
    });

    if (!product) {
      throw new NotFoundException('产品不存在');
    }

    // 检查是否已存在相同的购物车项
    const existingItem = await this.cartItemsRepository.findOne({
      where: {
        cartId: cart.id,
        productId: addToCartDto.productId,
        selectedColor: addToCartDto.selectedColor,
        selectedSize: addToCartDto.selectedSize,
      },
    });

    if (existingItem) {
      existingItem.quantity += addToCartDto.quantity;
      return await this.cartItemsRepository.save(existingItem);
    }

    const cartItem = this.cartItemsRepository.create({
      cart,
      product,
      quantity: addToCartDto.quantity,
      selectedColor: addToCartDto.selectedColor,
      selectedSize: addToCartDto.selectedSize,
      price: product.price,
    });

    return await this.cartItemsRepository.save(cartItem);
  }

  async updateItem(
    userId: number,
    itemId: number,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartItem> {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.cartItemsRepository.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException('购物车项不存在');
    }

    Object.assign(item, updateCartItemDto);
    return await this.cartItemsRepository.save(item);
  }

  async removeItem(userId: number, itemId: number): Promise<void> {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.cartItemsRepository.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException('购物车项不存在');
    }

    await this.cartItemsRepository.remove(item);
  }

  async getCart(userId: number): Promise<Cart> {
    return await this.getOrCreateCart(userId);
  }

  async clearCart(userId: number): Promise<void> {
    const cart = await this.getOrCreateCart(userId);
    await this.cartItemsRepository.delete({ cartId: cart.id });
  }

  async calculateTotal(userId: number): Promise<number> {
    const cart = await this.cartsRepository.findOne({
      where: { userId },
      relations: ['items'],
    });

    if (!cart) return 0;

    return cart.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  }
}
