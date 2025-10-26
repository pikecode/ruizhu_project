import { Product } from './product.entity';
export declare class ProductImage {
    id: number;
    productId: number;
    product: Product;
    imageUrl: string;
    displayOrder: number;
    isThumbnail: boolean;
    createdAt: Date;
}
