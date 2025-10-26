import { User } from '../../users/entities/user.entity';
import { CartItem } from './cart-item.entity';
export declare class Cart {
    id: number;
    userId: number;
    user: User;
    totalItems: number;
    totalPrice: number;
    items: CartItem[];
    createdAt: Date;
    updatedAt: Date;
}
