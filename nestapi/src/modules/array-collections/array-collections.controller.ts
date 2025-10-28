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
  HttpStatus,
} from '@nestjs/common';
import { ArrayCollectionsService } from './array-collections.service';
import { CreateArrayCollectionDto } from './dto/create-array-collection.dto';
import { UpdateArrayCollectionDto } from './dto/update-array-collection.dto';
import { CreateItemDto } from './dto/create-item.dto';
import {
  AddProductsToItemDto,
  RemoveProductsFromItemDto,
  UpdateItemProductsSortDto,
} from './dto/manage-products.dto';

@Controller('array-collections')
export class ArrayCollectionsController {
  constructor(private readonly service: ArrayCollectionsService) {}

  // ==================== 数组集合管理 ====================

  /**
   * 创建数组集合
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createArrayCollection(@Body() createDto: CreateArrayCollectionDto) {
    return await this.service.createArrayCollection(createDto);
  }

  /**
   * 获取数组集合列表
   */
  @Get()
  async getArrayCollectionsList(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.service.getArrayCollectionsList(page, limit);
  }

  /**
   * 获取数组集合详情
   */
  @Get(':id')
  async getArrayCollectionDetail(@Param('id') id: number) {
    return await this.service.getArrayCollectionDetail(id);
  }

  /**
   * 更新数组集合
   */
  @Put(':id')
  async updateArrayCollection(
    @Param('id') id: number,
    @Body() updateDto: UpdateArrayCollectionDto,
  ) {
    return await this.service.updateArrayCollection(id, updateDto);
  }

  /**
   * 删除数组集合
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteArrayCollection(@Param('id') id: number) {
    await this.service.deleteArrayCollection(id);
  }

  // ==================== 卡片项目管理 ====================

  /**
   * 创建卡片项目
   */
  @Post(':arrayCollectionId/items')
  @HttpCode(HttpStatus.CREATED)
  async createItem(
    @Param('arrayCollectionId') arrayCollectionId: number,
    @Body() createDto: CreateItemDto,
  ) {
    return await this.service.createItem(arrayCollectionId, createDto);
  }

  /**
   * 更新卡片项目
   */
  @Put('items/:itemId')
  async updateItem(
    @Param('itemId') itemId: number,
    @Body() updateDto: CreateItemDto,
  ) {
    return await this.service.updateItem(itemId, updateDto);
  }

  /**
   * 删除卡片项目
   */
  @Delete('items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteItem(@Param('itemId') itemId: number) {
    await this.service.deleteItem(itemId);
  }

  // ==================== 商品管理 ====================

  /**
   * 添加商品到卡片
   */
  @Post('items/:itemId/products')
  @HttpCode(HttpStatus.CREATED)
  async addProductsToItem(
    @Param('itemId') itemId: number,
    @Body() addDto: AddProductsToItemDto,
  ) {
    await this.service.addProductsToItem(itemId, addDto);
    return { message: '商品已添加' };
  }

  /**
   * 从卡片删除商品
   */
  @Delete('items/:itemId/products')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeProductsFromItem(
    @Param('itemId') itemId: number,
    @Body() removeDto: RemoveProductsFromItemDto,
  ) {
    await this.service.removeProductsFromItem(itemId, removeDto);
  }

  /**
   * 更新卡片内商品的排序
   */
  @Put('items/:itemId/products/sort')
  async updateItemProductsSort(
    @Param('itemId') itemId: number,
    @Body() updateDto: UpdateItemProductsSortDto,
  ) {
    await this.service.updateItemProductsSort(itemId, updateDto);
    return { message: '排序已更新' };
  }
}
