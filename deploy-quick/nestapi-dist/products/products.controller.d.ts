import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto, ProductDto } from './dto';
import { Product } from './entities/product.entity';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(query: ProductQueryDto): unknown;
    search(query: string, limit?: number): unknown;
    getFeatured(limit?: number): unknown;
    findByCategory(categoryId: number): unknown;
    findOne(id: number): Promise<ProductDto>;
    create(createProductDto: CreateProductDto): Promise<Product>;
    update(id: number, updateProductDto: UpdateProductDto): Promise<Product>;
    remove(id: number): Promise<void>;
    addImage(productId: number, body: {
        imageUrl: string;
        isThumbnail?: boolean;
    }): unknown;
    removeImage(imageId: number): Promise<void>;
    addVariant(productId: number, body: {
        color?: string;
        size?: string;
        stock?: number;
        priceAdjustment?: number;
    }): unknown;
}
