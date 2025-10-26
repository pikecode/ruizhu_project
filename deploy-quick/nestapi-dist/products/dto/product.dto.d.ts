import { ProductImageDto } from './product-image.dto';
import { ProductVariantDto } from './product-variant.dto';
export declare class ProductDto {
    id: number;
    name: string;
    sku: string;
    description: string;
    shortDescription: string;
    categoryId: number;
    price: number;
    originalPrice: number;
    stock: number;
    sales: number;
    status: string;
    rating: number;
    reviewCount: number;
    isFeatured: boolean;
    images: ProductImageDto[];
    variants: ProductVariantDto[];
    createdAt: Date;
    updatedAt: Date;
}
