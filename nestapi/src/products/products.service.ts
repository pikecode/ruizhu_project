import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, IsNull, In } from 'typeorm';
import { Product, ProductStatus } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private productImagesRepository: Repository<ProductImage>,
    @InjectRepository(ProductVariant)
    private productVariantsRepository: Repository<ProductVariant>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  /**
   * 获取产品列表（支持分页、筛选、搜索、排序）
   */
  async findAll(query: ProductQueryDto) {
    const {
      categoryId,
      page = 1,
      limit = 20,
      sort = 'created',
      order = 'desc',
      search,
      status,
    } = query;

    const builder = this.productsRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('product.category', 'category');

    // 应用筛选条件
    if (categoryId) {
      builder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (status) {
      builder.andWhere('product.status = :status', { status });
    }

    // 搜索功能
    if (search) {
      builder.andWhere(
        '(product.name LIKE :search OR product.sku LIKE :search OR product.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // 排序
    const sortMap = {
      price: 'product.price',
      sales: 'product.sales',
      rating: 'product.rating',
      created: 'product.createdAt',
    };
    const sortBy = sortMap[sort] || 'product.createdAt';
    builder.orderBy(sortBy, order.toUpperCase() as 'ASC' | 'DESC');

    // 分页
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

  /**
   * 获取单个产品详情
   */
  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['images', 'variants', 'category'],
    });

    if (!product) {
      throw new NotFoundException(`产品 ID ${id} 不存在`);
    }

    return product;
  }

  /**
   * 搜索产品
   */
  async search(query: string, limit: number = 10): Promise<Product[]> {
    return this.productsRepository
      .createQueryBuilder('product')
      .where('product.name LIKE :query', { query: `%${query}%` })
      .orWhere('product.sku LIKE :query', { query: `%${query}%` })
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.variants', 'variants')
      .take(limit)
      .getMany();
  }

  /**
   * 获取精选产品
   */
  async getFeatured(limit: number = 10): Promise<Product[]> {
    return this.productsRepository
      .createQueryBuilder('product')
      .where('product.isFeatured = :featured', { featured: true })
      .andWhere('product.status = :status', { status: ProductStatus.ACTIVE })
      .leftJoinAndSelect('product.images', 'images')
      .orderBy('product.displayOrder', 'ASC')
      .take(limit)
      .getMany();
  }

  /**
   * 创建产品
   */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    // 验证分类是否存在
    const category = await this.categoriesRepository.findOne({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(`分类 ID ${createProductDto.categoryId} 不存在`);
    }

    // 创建产品
    const product = this.productsRepository.create(createProductDto);
    return await this.productsRepository.save(product);
  }

  /**
   * 更新产品
   */
  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);

    Object.assign(product, updateProductDto);
    return await this.productsRepository.save(product);
  }

  /**
   * 删除产品（级联删除图片和变体）
   */
  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }

  /**
   * 添加产品图片
   */
  async addImage(
    productId: number,
    imageUrl: string,
    isThumbnail: boolean = false,
  ): Promise<ProductImage> {
    const product = await this.findOne(productId);

    const image = this.productImagesRepository.create({
      product,
      imageUrl,
      isThumbnail,
      displayOrder: 0,
    });

    return await this.productImagesRepository.save(image);
  }

  /**
   * 删除产品图片
   */
  async removeImage(imageId: number): Promise<void> {
    const image = await this.productImagesRepository.findOne({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException(`图片 ID ${imageId} 不存在`);
    }

    await this.productImagesRepository.remove(image);
  }

  /**
   * 添加产品变体
   */
  async addVariant(
    productId: number,
    color?: string,
    size?: string,
    stock: number = 0,
    priceAdjustment?: number,
  ): Promise<ProductVariant> {
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

  /**
   * 更新产品库存
   */
  async updateStock(productId: number, quantity: number): Promise<Product> {
    const product = await this.findOne(productId);
    product.stock = Math.max(0, product.stock + quantity);
    return await this.productsRepository.save(product);
  }

  /**
   * 按分类获取产品
   */
  async findByCategory(categoryId: number): Promise<Product[]> {
    return this.productsRepository
      .createQueryBuilder('product')
      .where('product.categoryId = :categoryId', { categoryId })
      .andWhere('product.status = :status', { status: ProductStatus.ACTIVE })
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.variants', 'variants')
      .orderBy('product.displayOrder', 'ASC')
      .getMany();
  }

  /**
   * 增加销售量
   */
  async incrementSales(productId: number, quantity: number = 1): Promise<void> {
    await this.productsRepository.increment(
      { id: productId },
      'sales',
      quantity,
    );
  }

  /**
   * 批量更新产品状态
   */
  async updateStatus(
    ids: number[],
    status: ProductStatus,
  ): Promise<void> {
    await this.productsRepository.update({ id: In(ids) }, { status });
  }
}
