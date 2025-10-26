import { ProductStatus } from '../entities/product.entity';
export declare class CreateProductDto {
    name: string;
    sku: string;
    description?: string;
    shortDescription?: string;
    categoryId: number;
    price: number;
    originalPrice?: number;
    stock?: number;
    status?: ProductStatus;
    isFeatured?: boolean;
    displayOrder?: number;
}
