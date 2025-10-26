import { Repository } from 'typeorm';
import { Product, ProductStatus } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
export declare class ProductsService {
    private productsRepository;
    private productImagesRepository;
    private productVariantsRepository;
    private categoriesRepository;
    constructor(productsRepository: Repository<Product>, productImagesRepository: Repository<ProductImage>, productVariantsRepository: Repository<ProductVariant>, categoriesRepository: Repository<Category>);
    findAll(query: ProductQueryDto): unknown;
    findOne(id: number): Promise<Product>;
    search(query: string, limit?: number): Promise<Product[]>;
    getFeatured(limit?: number): Promise<Product[]>;
    create(createProductDto: CreateProductDto): Promise<Product>;
    update(id: number, updateProductDto: UpdateProductDto): Promise<Product>;
    remove(id: number): Promise<void>;
    addImage(productId: number, imageUrl: string, isThumbnail?: boolean): Promise<ProductImage>;
    removeImage(imageId: number): Promise<void>;
    addVariant(productId: number, color?: string, size?: string, stock?: number, priceAdjustment?: number): Promise<ProductVariant>;
    updateStock(productId: number, quantity: number): Promise<Product>;
    findByCategory(categoryId: number): Promise<Product[]>;
    incrementSales(productId: number, quantity?: number): Promise<void>;
    updateStatus(ids: number[], status: ProductStatus): Promise<void>;
}
