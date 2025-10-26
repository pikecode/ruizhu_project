import { WishlistsService } from './wishlists.service';
export declare class WishlistsController {
    private readonly wishlistsService;
    constructor(wishlistsService: WishlistsService);
    getWishlist(): unknown;
    addToWishlist(productId: number): unknown;
    removeFromWishlist(productId: number): unknown;
}
