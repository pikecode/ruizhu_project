import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import {
  Product,
  ProductTag,
} from '../../entities/product.entity';
import { Category } from '../../entities/category.entity';
import {
  CreateCompleteProductDto,
  QueryProductDto,
  UpdateProductDto,
} from './dto';
import {
  ProductDetailResponseDto,
  ProductListItemDto,
  ProductListResponseDto,
} from './dto/product-response.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductTag)
    private readonly tagRepository: Repository<ProductTag>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * 将 stockStatus 转换为 isOutOfStock 和 isSoldOut
   */
  private convertStockStatusToFlags(
    stockStatus?: 'normal' | 'outOfStock' | 'soldOut',
  ): { isOutOfStock: boolean; isSoldOut: boolean } {
    if (stockStatus === 'outOfStock') {
      return { isOutOfStock: true, isSoldOut: false };
    } else if (stockStatus === 'soldOut') {
      return { isOutOfStock: false, isSoldOut: true };
    }
    return { isOutOfStock: false, isSoldOut: false };
  }

  /**
   * 将 isOutOfStock 和 isSoldOut 转换为 stockStatus
   */
  private convertFlagsToStockStatus(
    isOutOfStock: boolean,
    isSoldOut: boolean,
  ): 'normal' | 'outOfStock' | 'soldOut' {
    if (isSoldOut) {
      return 'soldOut';
    } else if (isOutOfStock) {
      return 'outOfStock';
    }
    return 'normal';
  }

  /**
   * 创建商品（完整信息）
   */
  async createProduct(
    createDto: CreateCompleteProductDto,
  ): Promise<ProductDetailResponseDto> {
    // 检查分类是否存在
    const category = await this.categoryRepository.findOne({
      where: { id: createDto.categoryId },
    });
    if (!category) {
      throw new BadRequestException(`分类 ID ${createDto.categoryId} 不存在`);
    }

    // 检查 SKU 是否唯一（仅在 SKU 被提供时）
    if (createDto.sku) {
      const existingProduct = await this.productRepository.findOne({
        where: { sku: createDto.sku },
      });
      if (existingProduct) {
        throw new BadRequestException(`SKU ${createDto.sku} 已存在`);
      }
    }

    // 处理库存状态：优先使用 stockStatus，如果没有提供则使用旧字段
    let isOutOfStock = createDto.isOutOfStock || false;
    let isSoldOut = createDto.isSoldOut || false;

    if (createDto.stockStatus) {
      const converted = this.convertStockStatusToFlags(createDto.stockStatus);
      isOutOfStock = converted.isOutOfStock;
      isSoldOut = converted.isSoldOut;
    }

    // 创建商品（包含价格字段）
    const product = this.productRepository.create({
      name: createDto.name,
      subtitle: createDto.subtitle,
      sku: createDto.sku,
      description: createDto.description,
      categoryId: createDto.categoryId,
      isNew: createDto.isNew || false,
      isSaleOn: createDto.isSaleOn !== false,
      isOutOfStock,
      isSoldOut,
      isVipOnly: createDto.isVipOnly || false,
      stockQuantity: createDto.stockQuantity || 0,
      lowStockThreshold: createDto.lowStockThreshold || 10,
      weight: createDto.weight,
      shippingTemplateId: createDto.shippingTemplateId,
      freeShippingThreshold: createDto.freeShippingThreshold,
      // 价格信息直接保存到 products 表
      originalPrice: createDto.price.originalPrice,
      currentPrice: createDto.price.currentPrice,
      discountRate: createDto.price.discountRate || 100,
      currency: createDto.price.currency || 'CNY',
      vipDiscountRate: createDto.price.vipDiscountRate,
      // 封面图片URL
      coverImageUrl: createDto.url || createDto.coverImageUrl || null,
    });

    const savedProduct = await this.productRepository.save(product);

    return this.getProductDetail(savedProduct.id);
  }

  /**
   * 获取商品详情
   */
  async getProductDetail(productId: number): Promise<ProductDetailResponseDto> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`商品 ID ${productId} 不存在`);
    }

    const tags = await this.tagRepository.find({ where: { productId } });

    const category = await this.categoryRepository.findOne({
      where: { id: product.categoryId },
    });

    // 更新浏览数（直接更新 product 表）
    product.viewsCount += 1;
    await this.productRepository.save(product);

    // 计算 stockStatus
    const stockStatus = this.convertFlagsToStockStatus(product.isOutOfStock, product.isSoldOut);

    return {
      id: product.id,
      name: product.name,
      subtitle: product.subtitle,
      sku: product.sku,
      description: product.description,
      categoryId: product.categoryId,
      categoryName: category?.name,
      isNew: product.isNew,
      isSaleOn: product.isSaleOn,
      isOutOfStock: product.isOutOfStock,
      isSoldOut: product.isSoldOut,
      isVipOnly: product.isVipOnly,
      stockStatus,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      weight: product.weight,
      shippingTemplateId: product.shippingTemplateId,
      freeShippingThreshold: product.freeShippingThreshold,
      coverImageUrl: product.coverImageUrl,
      // 价格信息直接从 product 对象获取
      price: {
        originalPrice: product.originalPrice,
        currentPrice: product.currentPrice,
        discountRate: product.discountRate,
        currency: product.currency,
        vipDiscountRate: product.vipDiscountRate,
      },
      stats: {
        salesCount: product.salesCount,
        viewsCount: product.viewsCount,
        averageRating: product.averageRating,
        reviewsCount: product.reviewsCount,
        favoritesCount: product.favoritesCount,
        conversionRate: product.conversionRate,
      },
      tags: tags.map((tag) => ({
        id: tag.id,
        tagName: tag.tagName,
      })),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  /**
   * 获取商品列表（带分页、搜索、筛选）
   */
  async getProductList(query: QueryProductDto): Promise<ProductListResponseDto> {
    const { page, limit, keyword, categoryId, minPrice, maxPrice, sort, isNew, onSale, tag } = query;

    // 构建查询条件
    let where: any = {};

    // 关键词搜索
    if (keyword) {
      where = {
        ...where,
        name: Like(`%${keyword}%`),
      };
    }

    // 分类筛选
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // 新品筛选
    if (isNew === 'true') {
      where.isNew = true;
    }

    // 上架筛选
    if (onSale === 'false') {
      where.isSaleOn = false;
    } else if (onSale === 'true') {
      where.isSaleOn = true;
    }

    // 缺货状态
    // where.isOutOfStock = false; // 只显示非缺货

    const skip = (page - 1) * limit;

    // 查询商品（价格和统计字段现在直接在 products 表中）
    let query_obj = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.tags', 'tags');

    // 应用 where 条件
    Object.entries(where).forEach(([key, value]) => {
      query_obj = query_obj.andWhere(`product.${key} = :${key}`, { [key]: value });
    });

    // 价格范围筛选
    if (minPrice || maxPrice) {
      if (minPrice && maxPrice) {
        query_obj = query_obj.andWhere('product.currentPrice BETWEEN :minPrice AND :maxPrice', {
          minPrice,
          maxPrice,
        });
      } else if (minPrice) {
        query_obj = query_obj.andWhere('product.currentPrice >= :minPrice', { minPrice });
      } else if (maxPrice) {
        query_obj = query_obj.andWhere('product.currentPrice <= :maxPrice', { maxPrice });
      }
    }

    // 标签筛选
    if (tag) {
      query_obj = query_obj.andWhere('tags.tagName = :tag', { tag });
    }

    // 排序（统计字段现在直接在 products 表中）
    let orderBy = 'product.createdAt';
    let orderDir: 'ASC' | 'DESC' = 'DESC';

    if (sort === 'price') {
      orderBy = 'product.currentPrice';
      orderDir = 'ASC';
    } else if (sort === '-price') {
      orderBy = 'product.currentPrice';
      orderDir = 'DESC';
    } else if (sort === 'sales') {
      orderBy = 'product.salesCount';
      orderDir = 'ASC';
    } else if (sort === '-sales') {
      orderBy = 'product.salesCount';
      orderDir = 'DESC';
    } else if (sort === 'rating') {
      orderBy = 'product.averageRating';
      orderDir = 'ASC';
    } else if (sort === '-rating') {
      orderBy = 'product.averageRating';
      orderDir = 'DESC';
    } else if (sort === '-created') {
      orderBy = 'product.createdAt';
      orderDir = 'DESC';
    }

    query_obj = query_obj.orderBy(orderBy, orderDir);

    // 分页
    query_obj = query_obj.skip(skip).take(limit);

    const [products, total] = await query_obj.getManyAndCount();

    // 转换为列表 DTO
    const items: ProductListItemDto[] = products.map((product) => {
      const stockStatus = this.convertFlagsToStockStatus(product.isOutOfStock, product.isSoldOut);
      return {
        id: product.id,
        name: product.name,
        subtitle: product.subtitle,
        sku: product.sku,
        categoryId: product.categoryId,
        currentPrice: product.currentPrice || 0,
        originalPrice: product.originalPrice || 0,
        discountRate: product.discountRate || 100,
        salesCount: product.salesCount || 0,
        averageRating: product.averageRating || 0,
        reviewsCount: product.reviewsCount || 0,
        isNew: product.isNew,
        isSaleOn: product.isSaleOn,
        isOutOfStock: product.isOutOfStock,
        isVipOnly: product.isVipOnly,
        stockStatus,
        stockQuantity: product.stockQuantity,
        coverImageUrl: product.coverImageUrl,
        coverImageId: product.coverImageId,
        tags: product.tags?.map((tag) => tag.tagName),
        createdAt: product.createdAt,
      };
    });

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * 更新商品
   */
  async updateProduct(
    productId: number,
    updateDto: UpdateProductDto,
  ): Promise<ProductDetailResponseDto> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`商品 ID ${productId} 不存在`);
    }

    // 检查分类
    if (updateDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateDto.categoryId },
      });
      if (!category) {
        throw new BadRequestException(`分类 ID ${updateDto.categoryId} 不存在`);
      }
    }

    // 分离特殊字段（url 和 coverImageUrl 都可以用来更新图片）
    const { url, coverImageUrl, stockStatus, ...otherUpdateData } = updateDto as any;

    // 处理库存状态：优先使用 stockStatus，如果没有提供则使用旧字段
    if (stockStatus) {
      const converted = this.convertStockStatusToFlags(stockStatus);
      otherUpdateData.isOutOfStock = converted.isOutOfStock;
      otherUpdateData.isSoldOut = converted.isSoldOut;
    }

    // 过滤掉不允许直接更新的字段
    const allowedFields = [
      'name', 'subtitle', 'sku', 'description', 'categoryId',
      'isNew', 'isSaleOn', 'isOutOfStock', 'isSoldOut', 'isVipOnly',
      'stockQuantity', 'lowStockThreshold', 'weight', 'shippingTemplateId',
      'freeShippingThreshold'
    ];

    const filteredUpdateData: any = {};
    allowedFields.forEach(field => {
      if (field in otherUpdateData) {
        filteredUpdateData[field] = otherUpdateData[field];
      }
    });

    // 更新商品基本信息
    Object.assign(product, filteredUpdateData);

    // 处理图片缓存字段更新（仅处理直接提供的 url 或 coverImageUrl）
    // 只有在提供了新的图片信息时才更新
    // 注意：images 数组和 coverImageUrl 是完全独立的字段，各自有各自的逻辑
    if (url) {
      product.coverImageUrl = url;
    } else if (coverImageUrl) {
      product.coverImageUrl = coverImageUrl;
    }

    // 处理价格更新（价格字段现在直接在 products 表中）
    if (updateDto.price) {
      product.originalPrice = updateDto.price.originalPrice;
      product.currentPrice = updateDto.price.currentPrice;
      product.discountRate = updateDto.price.discountRate || 100;
      product.currency = updateDto.price.currency || 'CNY';
      product.vipDiscountRate = updateDto.price.vipDiscountRate;
    }

    await this.productRepository.save(product);

    return this.getProductDetail(productId);
  }

  /**
   * 删除商品
   */
  async deleteProduct(productId: number): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`商品 ID ${productId} 不存在`);
    }

    // 删除关联数据（级联删除由数据库处理）
    await this.productRepository.remove(product);
  }

  /**
   * 按分类获取商品
   */
  async getProductsByCategory(categoryId: number, limit = 12): Promise<ProductListItemDto[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.tags', 'tags')
      .where('product.categoryId = :categoryId', { categoryId })
      .andWhere('product.isSaleOn = :isSaleOn', { isSaleOn: true })
      .orderBy('product.createdAt', 'DESC')
      .take(limit)
      .getMany();

    return products.map((product) => {
      const stockStatus = this.convertFlagsToStockStatus(product.isOutOfStock, product.isSoldOut);
      return {
        id: product.id,
        name: product.name,
        subtitle: product.subtitle,
        sku: product.sku,
        categoryId: product.categoryId,
        currentPrice: product.currentPrice || 0,
        originalPrice: product.originalPrice || 0,
        discountRate: product.discountRate || 100,
        salesCount: product.salesCount || 0,
        averageRating: product.averageRating || 0,
        reviewsCount: product.reviewsCount || 0,
        isNew: product.isNew,
        isSaleOn: product.isSaleOn,
        isOutOfStock: product.isOutOfStock,
        isVipOnly: product.isVipOnly,
        stockStatus,
        stockQuantity: product.stockQuantity,
        coverImageUrl: product.coverImageUrl,
        coverImageId: product.coverImageId,
        tags: product.tags?.map((tag) => tag.tagName),
        createdAt: product.createdAt,
      };
    });
  }

  /**
   * 获取热销商品
   */
  async getHotProducts(limit = 10): Promise<ProductListItemDto[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .where('product.isSaleOn = :isSaleOn', { isSaleOn: true })
      .orderBy('product.salesCount', 'DESC')
      .take(limit)
      .getMany();

    return products.map((product) => {
      const stockStatus = this.convertFlagsToStockStatus(product.isOutOfStock, product.isSoldOut);
      return {
        id: product.id,
        name: product.name,
        subtitle: product.subtitle,
        sku: product.sku,
        categoryId: product.categoryId,
        currentPrice: product.currentPrice || 0,
        originalPrice: product.originalPrice || 0,
        discountRate: product.discountRate || 100,
        salesCount: product.salesCount || 0,
        averageRating: product.averageRating || 0,
        reviewsCount: product.reviewsCount || 0,
        isNew: product.isNew,
        isSaleOn: product.isSaleOn,
        isOutOfStock: product.isOutOfStock,
        isVipOnly: product.isVipOnly,
        stockStatus,
        stockQuantity: product.stockQuantity,
        coverImageUrl: product.coverImageUrl,
        coverImageId: product.coverImageId,
        createdAt: product.createdAt,
      };
    });
  }

  /**
   * 搜索商品
   */
  async searchProducts(keyword: string, limit = 20): Promise<ProductListItemDto[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .where('product.name LIKE :keyword OR product.description LIKE :keyword', {
        keyword: `%${keyword}%`,
      })
      .andWhere('product.isSaleOn = :isSaleOn', { isSaleOn: true })
      .orderBy('product.createdAt', 'DESC')
      .take(limit)
      .getMany();

    return products.map((product) => {
      const stockStatus = this.convertFlagsToStockStatus(product.isOutOfStock, product.isSoldOut);
      return {
        id: product.id,
        name: product.name,
        subtitle: product.subtitle,
        sku: product.sku,
        categoryId: product.categoryId,
        currentPrice: product.currentPrice || 0,
        originalPrice: product.originalPrice || 0,
        discountRate: product.discountRate || 100,
        salesCount: product.salesCount || 0,
        averageRating: product.averageRating || 0,
        reviewsCount: product.reviewsCount || 0,
        isNew: product.isNew,
        isSaleOn: product.isSaleOn,
        isOutOfStock: product.isOutOfStock,
        isVipOnly: product.isVipOnly,
        stockStatus,
        stockQuantity: product.stockQuantity,
        coverImageUrl: product.coverImageUrl,
        coverImageId: product.coverImageId,
        createdAt: product.createdAt,
      };
    });
  }
}
