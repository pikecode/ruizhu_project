"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
const product_image_entity_1 = require("./entities/product-image.entity");
const product_variant_entity_1 = require("./entities/product-variant.entity");
const category_entity_1 = require("../categories/entities/category.entity");
let ProductsService = class ProductsService {
    productsRepository;
    productImagesRepository;
    productVariantsRepository;
    categoriesRepository;
    constructor(productsRepository, productImagesRepository, productVariantsRepository, categoriesRepository) {
        this.productsRepository = productsRepository;
        this.productImagesRepository = productImagesRepository;
        this.productVariantsRepository = productVariantsRepository;
        this.categoriesRepository = categoriesRepository;
    }
    async findAll(query) {
        const { categoryId, page = 1, limit = 20, sort = 'created', order = 'desc', search, status, } = query;
        const builder = this.productsRepository.createQueryBuilder('product')
            .leftJoinAndSelect('product.images', 'images')
            .leftJoinAndSelect('product.variants', 'variants')
            .leftJoinAndSelect('product.category', 'category');
        if (categoryId) {
            builder.andWhere('product.categoryId = :categoryId', { categoryId });
        }
        if (status) {
            builder.andWhere('product.status = :status', { status });
        }
        if (search) {
            builder.andWhere('(product.name LIKE :search OR product.sku LIKE :search OR product.description LIKE :search)', { search: `%${search}%` });
        }
        const sortMap = {
            price: 'product.price',
            sales: 'product.sales',
            rating: 'product.rating',
            created: 'product.createdAt',
        };
        const sortBy = sortMap[sort] || 'product.createdAt';
        builder.orderBy(sortBy, order.toUpperCase());
        const skip = (page - 1) * limit;
        const [data, total] = await builder
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const product = await this.productsRepository.findOne({
            where: { id },
            relations: ['images', 'variants', 'category'],
        });
        if (!product) {
            throw new common_1.NotFoundException(`产品 ID ${id} 不存在`);
        }
        return product;
    }
    async search(query, limit = 10) {
        return this.productsRepository
            .createQueryBuilder('product')
            .where('product.name LIKE :query', { query: `%${query}%` })
            .orWhere('product.sku LIKE :query', { query: `%${query}%` })
            .leftJoinAndSelect('product.images', 'images')
            .leftJoinAndSelect('product.variants', 'variants')
            .take(limit)
            .getMany();
    }
    async getFeatured(limit = 10) {
        return this.productsRepository
            .createQueryBuilder('product')
            .where('product.isFeatured = :featured', { featured: true })
            .andWhere('product.status = :status', { status: product_entity_1.ProductStatus.ACTIVE })
            .leftJoinAndSelect('product.images', 'images')
            .orderBy('product.displayOrder', 'ASC')
            .take(limit)
            .getMany();
    }
    async create(createProductDto) {
        const category = await this.categoriesRepository.findOne({
            where: { id: createProductDto.categoryId },
        });
        if (!category) {
            throw new common_1.NotFoundException(`分类 ID ${createProductDto.categoryId} 不存在`);
        }
        const product = this.productsRepository.create(createProductDto);
        return await this.productsRepository.save(product);
    }
    async update(id, updateProductDto) {
        const product = await this.findOne(id);
        Object.assign(product, updateProductDto);
        return await this.productsRepository.save(product);
    }
    async remove(id) {
        const product = await this.findOne(id);
        await this.productsRepository.remove(product);
    }
    async addImage(productId, imageUrl, isThumbnail = false) {
        const product = await this.findOne(productId);
        const image = this.productImagesRepository.create({
            product,
            imageUrl,
            isThumbnail,
            displayOrder: 0,
        });
        return await this.productImagesRepository.save(image);
    }
    async removeImage(imageId) {
        const image = await this.productImagesRepository.findOne({
            where: { id: imageId },
        });
        if (!image) {
            throw new common_1.NotFoundException(`图片 ID ${imageId} 不存在`);
        }
        await this.productImagesRepository.remove(image);
    }
    async addVariant(productId, color, size, stock = 0, priceAdjustment) {
        const product = await this.findOne(productId);
        const variant = this.productVariantsRepository.create({
            product,
            name: `${color || ''} ${size || ''}`.trim(),
            color,
            size,
            stock,
            priceAdjustment,
        });
        return await this.productVariantsRepository.save(variant);
    }
    async updateStock(productId, quantity) {
        const product = await this.findOne(productId);
        product.stock = Math.max(0, product.stock + quantity);
        return await this.productsRepository.save(product);
    }
    async findByCategory(categoryId) {
        return this.productsRepository
            .createQueryBuilder('product')
            .where('product.categoryId = :categoryId', { categoryId })
            .andWhere('product.status = :status', { status: product_entity_1.ProductStatus.ACTIVE })
            .leftJoinAndSelect('product.images', 'images')
            .leftJoinAndSelect('product.variants', 'variants')
            .orderBy('product.displayOrder', 'ASC')
            .getMany();
    }
    async incrementSales(productId, quantity = 1) {
        await this.productsRepository.increment({ id: productId }, 'sales', quantity);
    }
    async updateStatus(ids, status) {
        await this.productsRepository.update({ id: (0, typeorm_2.In)(ids) }, { status });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(product_image_entity_1.ProductImage)),
    __param(2, (0, typeorm_1.InjectRepository)(product_variant_entity_1.ProductVariant)),
    __param(3, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map