import { Cart } from './cart.entity';
import { Product } from '../../products/entities/product.entity';
export declare class CartItem {
    id: number;
    cartId: number;
    cart: Cart;
    productId: number;
    product: Product;
    quantity: number;
    selectedColor: string;
    selectedSize: string;
    price: number;
    isSelected: boolean;
    createdAt: Date;
    updatedAt: Date;
}
