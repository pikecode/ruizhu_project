import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Collection } from '../../entities/collection.entity';
import { CollectionProduct } from '../../entities/collection-product.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import {
  CollectionDetailResponseDto,
  CollectionListResponseDto,
  CollectionListItemDto,
  CollectionProductItemDto,
} from './dto/collection-response.dto';
import {
  AddProductsToCollectionDto,
  RemoveProductsFromCollectionDto,
  UpdateCollectionProductsSortDto,
} from './dto/manage-products.dto';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(CollectionProduct)
    private readonly collectionProductRepository: Repository<CollectionProduct>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 创建集合
   */
  async createCollection(createDto: CreateCollectionDto): Promise<Collection> {
    // 检查slug是否已存在
    const existingCollection = await this.collectionRepository.findOne({
      where: { slug: createDto.slug },
    });

    if (existingCollection) {
      throw new BadRequestException(`Slug "${createDto.slug}" 已经存在`);
    }

    const collection = this.collectionRepository.create(createDto);
    return await this.collectionRepository.save(collection);
  }

  /**
   * 更新集合
   */
  async updateCollection(id: number, updateDto: UpdateCollectionDto): Promise<Collection> {
    const collection = await this.collectionRepository.findOne({ where: { id } });

    if (!collection) {
      throw new NotFoundException(`集合 ID ${id} 不存在`);
    }

    // 注意：Slug 在创建时设置，之后不可修改
    // UpdateCollectionDto 中已移除 slug 字段，确保 slug 不会被意外修改
    Object.assign(collection, updateDto);
    return await this.collectionRepository.save(collection);
  }

  /**
   * 获取集合详情（包含所有产品）
   */
  async getCollectionDetail(id: number): Promise<CollectionDetailResponseDto> {
    const collection = await this.collectionRepository.findOne({ where: { id } });

    if (!collection) {
      throw new NotFoundException(`集合 ID ${id} 不存在`);
    }

    // 获取该集合的所有产品
    const products = await this.getCollectionProducts(id);

    return {
      ...collection,
      products,
      productCount: products.length,
    };
  }

  /**
   * 获取集合列表（Admin用）
   */
  async getCollectionsList(page: number = 1, limit: number = 10): Promise<CollectionListResponseDto> {
    const [items, total] = await this.collectionRepository.findAndCount({
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const pages = Math.ceil(total / limit);

    return {
      items: items as any,
      total,
      page,
      limit,
      pages,
    };
  }

  /**
   * 获取首页集合列表（小程序用）
   * 只返回 is_featured=1 的集合，并包含前N个产品
   */
  async getFeaturedCollectionsForHomepage(
    productsPerCollection: number = 6,
  ): Promise<CollectionListItemDto[]> {
    // 获取所有featured的集合
    const collections = await this.collectionRepository.find({
      where: { isFeatured: true, isActive: true },
      order: { sortOrder: 'ASC' },
    });

    const result: CollectionListItemDto[] = [];

    for (const collection of collections) {
      // 获取该集合的产品数量
      const productCount = await this.collectionProductRepository.count({
        where: { collectionId: collection.id },
      });

      // 获取该集合的前N个产品
      const featuredProducts = await this.getCollectionProducts(
        collection.id,
        productsPerCollection,
      );

      result.push({
        id: collection.id,
        name: collection.name,
        slug: collection.slug,
        description: collection.description,
        coverImageUrl: collection.coverImageUrl,
        iconUrl: collection.iconUrl,
        sortOrder: collection.sortOrder,
        productCount,
        featuredProducts,
      });
    }

    return result;
  }

  /**
   * 删除集合
   */
  async deleteCollection(id: number): Promise<void> {
    const collection = await this.collectionRepository.findOne({ where: { id } });

    if (!collection) {
      throw new NotFoundException(`集合 ID ${id} 不存在`);
    }

    // cascade delete会自动删除关联的 collection_products
    await this.collectionRepository.remove(collection);
  }

  /**
   * 获取集合内的产品列表
   */
  private async getCollectionProducts(
    collectionId: number,
    limit?: number,
  ): Promise<CollectionProductItemDto[]> {
    const query = this.dataSource
      .createQueryBuilder()
      .select('p.id', 'id')
      .addSelect('p.name', 'name')
      .addSelect('p.subtitle', 'subtitle')
      .addSelect('p.cover_image_url', 'coverImageUrl')
      .addSelect('p.is_new', 'isNew')
      .addSelect('p.is_sale_on', 'isSaleOn')
      .addSelect('p.is_out_of_stock', 'isOutOfStock')
      .addSelect('p.stock_quantity', 'stockQuantity')
      .addSelect('p.current_price', 'currentPrice')
      .addSelect('p.original_price', 'originalPrice')
      .addSelect('p.discount_rate', 'discountRate')
      .from('collection_products', 'cp')
      .innerJoin('products', 'p', 'cp.product_id = p.id')
      .where('cp.collection_id = :collectionId', { collectionId })
      .orderBy('cp.sort_order', 'ASC')
      .addOrderBy('cp.created_at', 'DESC');

    if (limit) {
      query.limit(limit);
    }

    const products = await query.getRawMany();

    // 获取每个产品的标签
    const productsWithTags: CollectionProductItemDto[] = [];
    for (const product of products) {
      const tags = await this.dataSource
        .createQueryBuilder()
        .select('tag_name')
        .from('product_tags', 'pt')
        .where('pt.product_id = :productId', { productId: product.id })
        .getRawMany();

      productsWithTags.push({
        ...product,
        tags: tags.map((t) => t.tag_name),
      });
    }

    return productsWithTags;
  }

  /**
   * 添加产品到集合
   */
  async addProductsToCollection(
    collectionId: number,
    addDto: AddProductsToCollectionDto,
  ): Promise<void> {
    // 验证集合是否存在
    const collection = await this.collectionRepository.findOne({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException(`集合 ID ${collectionId} 不存在`);
    }

    // 获取该集合当前最大的sortOrder
    const maxSortOrder = await this.dataSource
      .createQueryBuilder()
      .select('MAX(sort_order)', 'maxSortOrder')
      .from('collection_products', 'cp')
      .where('cp.collection_id = :collectionId', { collectionId })
      .getRawOne();

    const startSortOrder =
      addDto.startSortOrder ??
      ((maxSortOrder?.maxSortOrder ?? -1) + 1);

    // 批量添加产品
    const collectionProducts = addDto.productIds.map((productId, index) => ({
      collectionId,
      productId,
      sortOrder: startSortOrder + index,
    }));

    // 忽略重复的记录（product已经在collection中）
    const query = this.dataSource
      .createQueryBuilder()
      .insert()
      .into(CollectionProduct)
      .values(collectionProducts);

    await query.orIgnore().execute();
  }

  /**
   * 从集合删除产品
   */
  async removeProductsFromCollection(
    collectionId: number,
    removeDto: RemoveProductsFromCollectionDto,
  ): Promise<void> {
    // 验证集合是否存在
    const collection = await this.collectionRepository.findOne({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException(`集合 ID ${collectionId} 不存在`);
    }

    // 删除指定的产品关联
    await this.collectionProductRepository.delete({
      collectionId,
      productId: removeDto.productIds as any,
    });
  }

  /**
   * 调整集合内产品的顺序
   */
  async updateProductsSort(
    collectionId: number,
    updateDto: UpdateCollectionProductsSortDto,
  ): Promise<void> {
    // 验证集合是否存在
    const collection = await this.collectionRepository.findOne({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException(`集合 ID ${collectionId} 不存在`);
    }

    // 批量更新sort_order
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of updateDto.products) {
        await queryRunner.manager.update(
          CollectionProduct,
          {
            collectionId,
            productId: item.productId,
          },
          {
            sortOrder: item.sortOrder,
          },
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 按slug获取集合（小程序详情页用）
   */
  async getCollectionBySlug(slug: string): Promise<CollectionDetailResponseDto> {
    const collection = await this.collectionRepository.findOne({
      where: { slug },
    });

    if (!collection) {
      throw new NotFoundException(`集合 "${slug}" 不存在`);
    }

    const products = await this.getCollectionProducts(collection.id);

    return {
      ...collection,
      products,
      productCount: products.length,
    };
  }
}
