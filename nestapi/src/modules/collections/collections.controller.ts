import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import {
  AddProductsToCollectionDto,
  RemoveProductsFromCollectionDto,
  UpdateCollectionProductsSortDto,
} from './dto/manage-products.dto';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  /**
   * 获取首页集合列表（小程序用）
   * GET /api/v1/collections/home
   */
  @Get('home')
  async getHomeCollections(
    @Query('productsPerCollection') productsPerCollection?: number,
  ) {
    const collections = await this.collectionsService.getFeaturedCollectionsForHomepage(
      productsPerCollection || 6,
    );

    return {
      code: 200,
      message: 'Success',
      data: collections,
    };
  }

  /**
   * 按slug获取集合详情（小程序详情页用）
   * GET /api/v1/collections/:slug
   */
  @Get(':slug')
  async getCollectionBySlug(@Param('slug') slug: string) {
    if (!slug || slug.length === 0) {
      throw new BadRequestException('slug参数不能为空');
    }

    const collection = await this.collectionsService.getCollectionBySlug(slug);

    return {
      code: 200,
      message: 'Success',
      data: collection,
    };
  }

  /**
   * ========== Admin API (以下为后台管理API) ==========
   */

  /**
   * 创建集合
   * POST /api/v1/collections
   */
  @Post()
  @HttpCode(200)
  async createCollection(@Body() createDto: CreateCollectionDto) {
    const collection = await this.collectionsService.createCollection(createDto);

    return {
      code: 200,
      message: 'Collection created successfully',
      data: collection,
    };
  }

  /**
   * 获取集合列表（Admin）
   * GET /api/v1/collections?page=1&limit=10
   */
  @Get()
  async getCollectionsList(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const result = await this.collectionsService.getCollectionsList(page, limit);

    return {
      code: 200,
      message: 'Success',
      data: result,
    };
  }

  /**
   * 更新集合
   * PUT /api/v1/collections/:id
   */
  @Put(':id')
  @HttpCode(200)
  async updateCollection(
    @Param('id') id: string,
    @Body() updateDto: UpdateCollectionDto,
  ) {
    const collectionId = parseInt(id, 10);
    const collection = await this.collectionsService.updateCollection(collectionId, updateDto);

    return {
      code: 200,
      message: 'Collection updated successfully',
      data: collection,
    };
  }

  /**
   * 获取集合详情（Admin）
   * GET /api/v1/collections/:id/detail
   */
  @Get(':id/detail')
  async getCollectionDetail(@Param('id') id: string) {
    const collectionId = parseInt(id, 10);
    const collection = await this.collectionsService.getCollectionDetail(collectionId);

    return {
      code: 200,
      message: 'Success',
      data: collection,
    };
  }

  /**
   * 删除集合
   * DELETE /api/v1/collections/:id
   */
  @Delete(':id')
  @HttpCode(200)
  async deleteCollection(@Param('id') id: string) {
    const collectionId = parseInt(id, 10);
    await this.collectionsService.deleteCollection(collectionId);

    return {
      code: 200,
      message: 'Collection deleted successfully',
    };
  }

  /**
   * ========== 集合内产品管理 API ==========
   */

  /**
   * 添加产品到集合
   * POST /api/v1/collections/:id/products/add
   */
  @Post(':id/products/add')
  @HttpCode(200)
  async addProductsToCollection(
    @Param('id') id: string,
    @Body() addDto: AddProductsToCollectionDto,
  ) {
    const collectionId = parseInt(id, 10);
    await this.collectionsService.addProductsToCollection(collectionId, addDto);

    return {
      code: 200,
      message: 'Products added to collection successfully',
    };
  }

  /**
   * 从集合删除产品
   * DELETE /api/v1/collections/:id/products/remove
   */
  @Delete(':id/products/remove')
  @HttpCode(200)
  async removeProductsFromCollection(
    @Param('id') id: string,
    @Body() removeDto: RemoveProductsFromCollectionDto,
  ) {
    const collectionId = parseInt(id, 10);
    await this.collectionsService.removeProductsFromCollection(collectionId, removeDto);

    return {
      code: 200,
      message: 'Products removed from collection successfully',
    };
  }

  /**
   * 调整集合内产品顺序
   * PUT /api/v1/collections/:id/products/sort
   */
  @Put(':id/products/sort')
  @HttpCode(200)
  async updateProductsSort(
    @Param('id') id: string,
    @Body() updateDto: UpdateCollectionProductsSortDto,
  ) {
    const collectionId = parseInt(id, 10);
    await this.collectionsService.updateProductsSort(collectionId, updateDto);

    return {
      code: 200,
      message: 'Products sort order updated successfully',
    };
  }
}
