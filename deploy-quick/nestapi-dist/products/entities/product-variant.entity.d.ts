import { Product } from './product.entity';
export declare class ProductVariant {
    id: number;
    productId: number;
    product: Product;
    name: string;
    color: string;
    size: string;
    priceAdjustment: number;
    variantSku: string;
    stock: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
