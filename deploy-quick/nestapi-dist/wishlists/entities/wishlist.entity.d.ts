import { User } from '../../users/entities/user.entity';
import { WishlistItem } from './wishlist-item.entity';
export declare class Wishlist {
    id: number;
    userId: number;
    user: User;
    items: WishlistItem[];
    createdAt: Date;
    updatedAt: Date;
}
