import { Category } from '../../categories/entities/category.entity';
import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';
export declare enum ProductStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    INACTIVE = "inactive",
    OUT_OF_STOCK = "out_of_stock"
}
export declare class Product {
    id: number;
    name: string;
    sku: string;
    description: string;
    shortDescription: string;
    categoryId: number;
    category: Category;
    price: number;
    originalPrice: number;
    stock: number;
    sales: number;
    status: ProductStatus;
    rating: number;
    reviewCount: number;
    isFeatured: boolean;
    displayOrder: number;
    images: ProductImage[];
    variants: ProductVariant[];
    createdAt: Date;
    updatedAt: Date;
}
