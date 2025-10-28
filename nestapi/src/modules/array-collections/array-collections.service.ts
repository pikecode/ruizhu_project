import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ArrayCollection } from '../../entities/array-collection.entity';
import { ArrayCollectionItem } from '../../entities/array-collection-item.entity';
import { ArrayCollectionItemProduct } from '../../entities/array-collection-item-product.entity';
import { CreateArrayCollectionDto } from './dto/create-array-collection.dto';
import { UpdateArrayCollectionDto } from './dto/update-array-collection.dto';
import { CreateItemDto } from './dto/create-item.dto';
import {
  ArrayCollectionDetailResponseDto,
  ArrayCollectionListResponseDto,
  ArrayCollectionItemDto,
  ArrayCollectionItemProductDto,
} from './dto/array-collection-response.dto';
import {
  AddProductsToItemDto,
  RemoveProductsFromItemDto,
  UpdateItemProductsSortDto,
} from './dto/manage-products.dto';

@Injectable()
export class ArrayCollectionsService {
  constructor(
    @InjectRepository(ArrayCollection)
    private readonly arrayCollectionRepository: Repository<ArrayCollection>,
    @InjectRepository(ArrayCollectionItem)
    private readonly itemRepository: Repository<ArrayCollectionItem>,
    @InjectRepository(ArrayCollectionItemProduct)
    private readonly itemProductRepository: Repository<ArrayCollectionItemProduct>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 创建数组集合
   */
  async createArrayCollection(createDto: CreateArrayCollectionDto): Promise<ArrayCollection> {
    const collection = this.arrayCollectionRepository.create(createDto);
    return await this.arrayCollectionRepository.save(collection);
  }

  /**
   * 更新数组集合
   */
  async updateArrayCollection(
    id: number,
    updateDto: UpdateArrayCollectionDto,
  ): Promise<ArrayCollection> {
    const collection = await this.arrayCollectionRepository.findOne({ where: { id } });

    if (!collection) {
      throw new NotFoundException(`数组集合 ID ${id} 不存在`);
    }

    Object.assign(collection, updateDto);
    return await this.arrayCollectionRepository.save(collection);
  }

  /**
   * 获取数组集合列表（Admin用）
   */
  async getArrayCollectionsList(
    page: number = 1,
    limit: number = 10,
  ): Promise<ArrayCollectionListResponseDto> {
    const [items, total] = await this.arrayCollectionRepository.findAndCount({
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const pages = Math.ceil(total / limit);

    // 为每个集合获取详细信息
    const itemsWithDetails = await Promise.all(
      items.map((collection) => this.getArrayCollectionDetail(collection.id)),
    );

    return {
      items: itemsWithDetails,
      total,
      page,
      limit,
      pages,
    };
  }

  /**
   * 获取数组集合详情（包含所有项目和商品）
   */
  async getArrayCollectionDetail(id: number): Promise<ArrayCollectionDetailResponseDto> {
    const collection = await this.arrayCollectionRepository.findOne({ where: { id } });

    if (!collection) {
      throw new NotFoundException(`数组集合 ID ${id} 不存在`);
    }

    const items = await this.getCollectionItems(id);

    return {
      id: collection.id,
      title: collection.title,
      description: collection.description,
      sortOrder: collection.sortOrder,
      isActive: collection.isActive,
      remark: collection.remark,
      items,
      itemCount: items.length,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    };
  }

  /**
   * 删除数组集合
   */
  async deleteArrayCollection(id: number): Promise<void> {
    const collection = await this.arrayCollectionRepository.findOne({ where: { id } });

    if (!collection) {
      throw new NotFoundException(`数组集合 ID ${id} 不存在`);
    }

    await this.arrayCollectionRepository.remove(collection);
  }

  /**
   * 创建集合项目（卡片）
   */
  async createItem(arrayCollectionId: number, createDto: CreateItemDto): Promise<ArrayCollectionItem> {
    // 验证集合是否存在
    const collection = await this.arrayCollectionRepository.findOne({
      where: { id: arrayCollectionId },
    });

    if (!collection) {
      throw new NotFoundException(`数组集合 ID ${arrayCollectionId} 不存在`);
    }

    const item = this.itemRepository.create({
      ...createDto,
      arrayCollectionId,
    });

    return await this.itemRepository.save(item);
  }

  /**
   * 更新集合项目
   */
  async updateItem(itemId: number, updateDto: CreateItemDto): Promise<ArrayCollectionItem> {
    const item = await this.itemRepository.findOne({ where: { id: itemId } });

    if (!item) {
      throw new NotFoundException(`项目 ID ${itemId} 不存在`);
    }

    Object.assign(item, updateDto);
    return await this.itemRepository.save(item);
  }

  /**
   * 删除集合项目
   */
  async deleteItem(itemId: number): Promise<void> {
    const item = await this.itemRepository.findOne({ where: { id: itemId } });

    if (!item) {
      throw new NotFoundException(`项目 ID ${itemId} 不存在`);
    }

    await this.itemRepository.remove(item);
  }

  /**
   * 获取集合内的所有项目
   */
  private async getCollectionItems(
    collectionId: number,
    limit?: number,
  ): Promise<ArrayCollectionItemDto[]> {
    const query = this.itemRepository
      .createQueryBuilder('item')
      .where('item.arrayCollectionId = :collectionId', { collectionId })
      .orderBy('item.sortOrder', 'ASC')
      .addOrderBy('item.createdAt', 'DESC');

    if (limit) {
      query.limit(limit);
    }

    const items = await query.getMany();

    // 为每个项目获取商品
    const itemsWithProducts: ArrayCollectionItemDto[] = [];
    for (const item of items) {
      const products = await this.getItemProducts(item.id);
      itemsWithProducts.push({
        id: item.id,
        title: item.title,
        description: item.description,
        coverImageUrl: item.coverImageUrl,
        sortOrder: item.sortOrder,
        products,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      });
    }

    return itemsWithProducts;
  }

  /**
   * 获取项目内的商品列表
   */
  private async getItemProducts(itemId: number): Promise<ArrayCollectionItemProductDto[]> {
    const query = this.dataSource
      .createQueryBuilder()
      .select('p.id', 'id')
      .addSelect('p.name', 'name')
      .addSelect('p.subtitle', 'subtitle')
      .addSelect('p.sku', 'sku')
      .addSelect('p.cover_image_url', 'coverImageUrl')
      .addSelect('p.is_new', 'isNew')
      .addSelect('p.is_sale_on', 'isSaleOn')
      .addSelect('p.is_out_of_stock', 'isOutOfStock')
      .addSelect('p.stock_quantity', 'stockQuantity')
      .addSelect('pp.current_price', 'currentPrice')
      .addSelect('pp.original_price', 'originalPrice')
      .addSelect('pp.discount_rate', 'discountRate')
      .from('array_collection_item_products', 'acip')
      .innerJoin('products', 'p', 'acip.product_id = p.id')
      .leftJoin('product_prices', 'pp', 'p.id = pp.product_id')
      .where('acip.array_collection_item_id = :itemId', { itemId })
      .orderBy('acip.sort_order', 'ASC')
      .addOrderBy('acip.created_at', 'DESC');

    const products = await query.getRawMany();

    // 获取每个产品的标签
    const productsWithTags: ArrayCollectionItemProductDto[] = [];
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
   * 添加商品到项目
   */
  async addProductsToItem(itemId: number, addDto: AddProductsToItemDto): Promise<void> {
    // 验证项目是否存在
    const item = await this.itemRepository.findOne({ where: { id: itemId } });

    if (!item) {
      throw new NotFoundException(`项目 ID ${itemId} 不存在`);
    }

    // 获取该项目当前最大的sortOrder
    const maxSortOrder = await this.dataSource
      .createQueryBuilder()
      .select('MAX(sort_order)', 'maxSortOrder')
      .from('array_collection_item_products', 'acip')
      .where('acip.array_collection_item_id = :itemId', { itemId })
      .getRawOne();

    const startSortOrder = addDto.startSortOrder ?? ((maxSortOrder?.maxSortOrder ?? -1) + 1);

    // 批量添加商品
    const itemProducts = addDto.productIds.map((productId, index) => ({
      arrayCollectionItemId: itemId,
      productId,
      sortOrder: startSortOrder + index,
    }));

    // 忽略重复的记录
    const query = this.dataSource
      .createQueryBuilder()
      .insert()
      .into(ArrayCollectionItemProduct)
      .values(itemProducts);

    await query.orIgnore().execute();
  }

  /**
   * 从项目删除商品
   */
  async removeProductsFromItem(
    itemId: number,
    removeDto: RemoveProductsFromItemDto,
  ): Promise<void> {
    // 验证项目是否存在
    const item = await this.itemRepository.findOne({ where: { id: itemId } });

    if (!item) {
      throw new NotFoundException(`项目 ID ${itemId} 不存在`);
    }

    // 删除指定的商品关联
    await this.itemProductRepository.delete({
      arrayCollectionItemId: itemId,
      productId: removeDto.productIds as any,
    });
  }

  /**
   * 调整项目内商品的顺序
   */
  async updateItemProductsSort(
    itemId: number,
    updateDto: UpdateItemProductsSortDto,
  ): Promise<void> {
    // 验证项目是否存在
    const item = await this.itemRepository.findOne({ where: { id: itemId } });

    if (!item) {
      throw new NotFoundException(`项目 ID ${itemId} 不存在`);
    }

    // 批量更新sort_order
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const product of updateDto.products) {
        await queryRunner.manager.update(
          ArrayCollectionItemProduct,
          {
            arrayCollectionItemId: itemId,
            productId: product.productId,
          },
          {
            sortOrder: product.sortOrder,
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
}
