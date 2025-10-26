import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';
export declare class WishlistsService {
    private wishlistsRepository;
    private wishlistItemsRepository;
    constructor(wishlistsRepository: Repository<Wishlist>, wishlistItemsRepository: Repository<WishlistItem>);
    getOrCreateWishlist(userId: number): Promise<Wishlist>;
    addToWishlist(userId: number, productId: number): unknown;
    removeFromWishlist(userId: number, productId: number): any;
    getWishlist(userId: number): unknown;
}
