import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { AddToCartDto, UpdateCartItemDto } from './dto/add-to-cart.dto';
export declare class CartsService {
    private cartsRepository;
    private cartItemsRepository;
    private productsRepository;
    constructor(cartsRepository: Repository<Cart>, cartItemsRepository: Repository<CartItem>, productsRepository: Repository<Product>);
    getOrCreateCart(userId: number): Promise<Cart>;
    addItem(userId: number, addToCartDto: AddToCartDto): Promise<CartItem>;
    updateItem(userId: number, itemId: number, updateCartItemDto: UpdateCartItemDto): Promise<CartItem>;
    removeItem(userId: number, itemId: number): Promise<void>;
    getCart(userId: number): Promise<Cart>;
    clearCart(userId: number): Promise<void>;
    calculateTotal(userId: number): Promise<number>;
}
