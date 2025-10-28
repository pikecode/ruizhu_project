import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import {
  Product,
  ProductPrice,
  ProductImage,
  ProductStats,
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
    @InjectRepository(ProductPrice)
    private readonly priceRepository: Repository<ProductPrice>,
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,
    @InjectRepository(ProductStats)
    private readonly statsRepository: Repository<ProductStats>,
    @InjectRepository(ProductTag)
    private readonly tagRepository: Repository<ProductTag>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

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

    // 创建商品
    const product = this.productRepository.create({
      name: createDto.name,
      subtitle: createDto.subtitle,
      sku: createDto.sku,
      description: createDto.description,
      categoryId: createDto.categoryId,
      isNew: createDto.isNew || false,
      isSaleOn: createDto.isSaleOn !== false,
      isOutOfStock: createDto.isOutOfStock || false,
      isSoldOut: createDto.isSoldOut || false,
      isVipOnly: createDto.isVipOnly || false,
      stockQuantity: createDto.stockQuantity || 0,
      lowStockThreshold: createDto.lowStockThreshold || 10,
      weight: createDto.weight,
      shippingTemplateId: createDto.shippingTemplateId,
      freeShippingThreshold: createDto.freeShippingThreshold,
    });

    const savedProduct = await this.productRepository.save(product);

    // 创建价格信息
    const price = this.priceRepository.create({
      productId: savedProduct.id,
      originalPrice: createDto.price.originalPrice,
      currentPrice: createDto.price.currentPrice,
      discountRate: createDto.price.discountRate || 100,
      currency: createDto.price.currency || 'CNY',
      vipDiscountRate: createDto.price.vipDiscountRate,
    });
    await this.priceRepository.save(price);

    // 创建统计信息
    const stats = this.statsRepository.create({
      productId: savedProduct.id,
      salesCount: 0,
      viewsCount: 0,
      averageRating: 0,
      reviewsCount: 0,
      favoritesCount: 0,
    });
    await this.statsRepository.save(stats);

    // 创建图片
    if (createDto.images && createDto.images.length > 0) {
      const images = createDto.images.map((img, index) =>
        this.imageRepository.create({
          productId: savedProduct.id,
          imageUrl: img.imageUrl,
          imageType: img.imageType,
          altText: img.altText,
          sortOrder: img.sortOrder ?? index,
        }),
      );
      const savedImages = await this.imageRepository.save(images);

      // 自动设置 cover 图片缓存（第一张图片）
      if (savedImages.length > 0) {
        const firstImage = savedImages[0];
        savedProduct.coverImageUrl = firstImage.imageUrl;
        savedProduct.coverImageId = firstImage.id;
        await this.productRepository.save(savedProduct);
      }
    }

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

    const [price, stats, images, tags] = await Promise.all([
      this.priceRepository.findOne({ where: { productId } }),
      this.statsRepository.findOne({ where: { productId } }),
      this.imageRepository.find({ where: { productId }, order: { sortOrder: 'ASC' } }),
      this.tagRepository.find({ where: { productId } }),
    ]);

    const category = await this.categoryRepository.findOne({
      where: { id: product.categoryId },
    });

    // 更新浏览数
    if (stats) {
      stats.viewsCount += 1;
      await this.statsRepository.save(stats);
    }

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
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      weight: product.weight,
      shippingTemplateId: product.shippingTemplateId,
      freeShippingThreshold: product.freeShippingThreshold,
      coverImageUrl: product.coverImageUrl,
      coverImageId: product.coverImageId,
      price: price ? {
        id: price.id,
        originalPrice: price.originalPrice,
        currentPrice: price.currentPrice,
        discountRate: price.discountRate,
        currency: price.currency,
        vipDiscountRate: price.vipDiscountRate,
      } : undefined,
      stats: stats ? {
        salesCount: stats.salesCount,
        viewsCount: stats.viewsCount,
        averageRating: stats.averageRating,
        reviewsCount: stats.reviewsCount,
        favoritesCount: stats.favoritesCount,
        conversionRate: stats.conversionRate,
      } : undefined,
      images: images.map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        imageType: img.imageType,
        altText: img.altText,
        sortOrder: img.sortOrder,
        width: img.width,
        height: img.height,
      })),
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

    // 查询商品（不再关联 images，直接使用 coverImageUrl 缓存字段）
    let query_obj = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.price', 'price')
      .leftJoinAndSelect('product.stats', 'stats')
      .leftJoinAndSelect('product.tags', 'tags');

    // 应用 where 条件
    Object.entries(where).forEach(([key, value]) => {
      query_obj = query_obj.andWhere(`product.${key} = :${key}`, { [key]: value });
    });

    // 价格范围筛选
    if (minPrice || maxPrice) {
      if (minPrice && maxPrice) {
        query_obj = query_obj.andWhere('price.currentPrice BETWEEN :minPrice AND :maxPrice', {
          minPrice,
          maxPrice,
        });
      } else if (minPrice) {
        query_obj = query_obj.andWhere('price.currentPrice >= :minPrice', { minPrice });
      } else if (maxPrice) {
        query_obj = query_obj.andWhere('price.currentPrice <= :maxPrice', { maxPrice });
      }
    }

    // 标签筛选
    if (tag) {
      query_obj = query_obj.andWhere('tags.tagName = :tag', { tag });
    }

    // 排序
    let orderBy = 'product.createdAt';
    let orderDir: 'ASC' | 'DESC' = 'DESC';

    if (sort === 'price') {
      orderBy = 'price.currentPrice';
      orderDir = 'ASC';
    } else if (sort === '-price') {
      orderBy = 'price.currentPrice';
      orderDir = 'DESC';
    } else if (sort === 'sales') {
      orderBy = 'stats.salesCount';
      orderDir = 'ASC';
    } else if (sort === '-sales') {
      orderBy = 'stats.salesCount';
      orderDir = 'DESC';
    } else if (sort === 'rating') {
      orderBy = 'stats.averageRating';
      orderDir = 'ASC';
    } else if (sort === '-rating') {
      orderBy = 'stats.averageRating';
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
    const items: ProductListItemDto[] = products.map((product) => ({
      id: product.id,
      name: product.name,
      subtitle: product.subtitle,
      sku: product.sku,
      categoryId: product.categoryId,
      currentPrice: product.price?.currentPrice || 0,
      originalPrice: product.price?.originalPrice || 0,
      discountRate: product.price?.discountRate || 100,
      salesCount: product.stats?.salesCount || 0,
      averageRating: product.stats?.averageRating || 0,
      reviewsCount: product.stats?.reviewsCount || 0,
      isNew: product.isNew,
      isSaleOn: product.isSaleOn,
      isOutOfStock: product.isOutOfStock,
      isVipOnly: product.isVipOnly,
      stockQuantity: product.stockQuantity,
      coverImageUrl: product.coverImageUrl,
      coverImageId: product.coverImageId,
      tags: product.tags?.map((tag) => tag.tagName),
      createdAt: product.createdAt,
    }));

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

    // 分离 images 字段（特殊处理）
    const { images, ...otherUpdateData } = updateDto as any;

    // 更新商品基本信息
    Object.assign(product, otherUpdateData);
    await this.productRepository.save(product);

    // 处理价格更新
    if (updateDto.price) {
      let price = await this.priceRepository.findOne({ where: { productId } });
      if (!price) {
        price = this.priceRepository.create({
          productId,
          originalPrice: updateDto.price.originalPrice,
          currentPrice: updateDto.price.currentPrice,
          discountRate: updateDto.price.discountRate || 100,
          currency: updateDto.price.currency || 'CNY',
          vipDiscountRate: updateDto.price.vipDiscountRate,
        });
      } else {
        Object.assign(price, updateDto.price);
      }
      await this.priceRepository.save(price);
    }

    // 处理图片更新
    if (images && Array.isArray(images)) {
      // 删除旧图片
      await this.imageRepository.delete({ productId });

      // 创建新图片
      if (images.length > 0) {
        const newImages = images.map((img: any, index: number) =>
          this.imageRepository.create({
            productId,
            imageUrl: img.imageUrl,
            imageType: img.imageType,
            altText: img.altText || '',
            sortOrder: index,
          }),
        );
        const savedNewImages = await this.imageRepository.save(newImages);

        // 更新 cover 图片缓存（第一张图片）
        const firstImage = savedNewImages[0];
        product.coverImageUrl = firstImage.imageUrl;
        product.coverImageId = firstImage.id;
        await this.productRepository.save(product);
      } else {
        // 如果没有图片了，清空 cover 缓存
        product.coverImageUrl = null;
        product.coverImageId = null;
        await this.productRepository.save(product);
      }
    }

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
      .leftJoinAndSelect('product.price', 'price')
      .leftJoinAndSelect('product.stats', 'stats')
      .leftJoinAndSelect('product.tags', 'tags')
      .where('product.categoryId = :categoryId', { categoryId })
      .andWhere('product.isSaleOn = :isSaleOn', { isSaleOn: true })
      .orderBy('product.createdAt', 'DESC')
      .take(limit)
      .getMany();

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      subtitle: product.subtitle,
      sku: product.sku,
      categoryId: product.categoryId,
      currentPrice: product.price?.currentPrice || 0,
      originalPrice: product.price?.originalPrice || 0,
      discountRate: product.price?.discountRate || 100,
      salesCount: product.stats?.salesCount || 0,
      averageRating: product.stats?.averageRating || 0,
      reviewsCount: product.stats?.reviewsCount || 0,
      isNew: product.isNew,
      isSaleOn: product.isSaleOn,
      isOutOfStock: product.isOutOfStock,
      isVipOnly: product.isVipOnly,
      stockQuantity: product.stockQuantity,
      coverImageUrl: product.coverImageUrl,
      coverImageId: product.coverImageId,
      tags: product.tags?.map((tag) => tag.tagName),
      createdAt: product.createdAt,
    }));
  }

  /**
   * 获取热销商品
   */
  async getHotProducts(limit = 10): Promise<ProductListItemDto[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.price', 'price')
      .leftJoinAndSelect('product.stats', 'stats')
      .where('product.isSaleOn = :isSaleOn', { isSaleOn: true })
      .orderBy('stats.salesCount', 'DESC')
      .take(limit)
      .getMany();

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      subtitle: product.subtitle,
      sku: product.sku,
      categoryId: product.categoryId,
      currentPrice: product.price?.currentPrice || 0,
      originalPrice: product.price?.originalPrice || 0,
      discountRate: product.price?.discountRate || 100,
      salesCount: product.stats?.salesCount || 0,
      averageRating: product.stats?.averageRating || 0,
      reviewsCount: product.stats?.reviewsCount || 0,
      isNew: product.isNew,
      isSaleOn: product.isSaleOn,
      isOutOfStock: product.isOutOfStock,
      isVipOnly: product.isVipOnly,
      stockQuantity: product.stockQuantity,
      coverImageUrl: product.coverImageUrl,
      coverImageId: product.coverImageId,
      createdAt: product.createdAt,
    }));
  }

  /**
   * 搜索商品
   */
  async searchProducts(keyword: string, limit = 20): Promise<ProductListItemDto[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.price', 'price')
      .leftJoinAndSelect('product.stats', 'stats')
      .where('product.name LIKE :keyword OR product.description LIKE :keyword', {
        keyword: `%${keyword}%`,
      })
      .andWhere('product.isSaleOn = :isSaleOn', { isSaleOn: true })
      .orderBy('product.createdAt', 'DESC')
      .take(limit)
      .getMany();

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      subtitle: product.subtitle,
      sku: product.sku,
      categoryId: product.categoryId,
      currentPrice: product.price?.currentPrice || 0,
      originalPrice: product.price?.originalPrice || 0,
      discountRate: product.price?.discountRate || 100,
      salesCount: product.stats?.salesCount || 0,
      averageRating: product.stats?.averageRating || 0,
      reviewsCount: product.stats?.reviewsCount || 0,
      isNew: product.isNew,
      isSaleOn: product.isSaleOn,
      isOutOfStock: product.isOutOfStock,
      isVipOnly: product.isVipOnly,
      stockQuantity: product.stockQuantity,
      coverImageUrl: product.coverImageUrl,
      coverImageId: product.coverImageId,
      createdAt: product.createdAt,
    }));
  }
}
