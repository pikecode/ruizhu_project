import { Product } from '../../products/entities/product.entity';
export declare class Collection {
    id: number;
    name: string;
    description: string;
    coverImage: string;
    bannerImage: string;
    products: Product[];
    displayOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
