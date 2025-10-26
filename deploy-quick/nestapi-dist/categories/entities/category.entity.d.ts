import { Product } from '../../products/entities/product.entity';
export declare class Category {
    id: number;
    name: string;
    description: string;
    icon: string;
    displayOrder: number;
    isActive: boolean;
    products: Product[];
    createdAt: Date;
    updatedAt: Date;
}
