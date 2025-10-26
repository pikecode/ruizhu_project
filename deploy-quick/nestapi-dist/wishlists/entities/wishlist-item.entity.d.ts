import { Wishlist } from './wishlist.entity';
import { Product } from '../../products/entities/product.entity';
export declare class WishlistItem {
    id: number;
    wishlistId: number;
    wishlist: Wishlist;
    productId: number;
    product: Product;
    createdAt: Date;
}
