import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  CreateCompleteProductDto,
  QueryProductDto,
  UpdateProductDto,
} from './dto';
import {
  ProductDetailResponseDto,
  ProductListResponseDto,
  ProductListItemDto,
} from './dto/product-response.dto';

/**
 * Admin 产品管理控制器
 * 路由前缀: /api/admin/products
 * 注：管理系统使用独立的 /admin/* 路由与消费端区分，不需要额外的权限守卫
 */
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * 创建商品
   * POST /api/admin/products
   */
  @Post()
  @HttpCode(201)
  async createProduct(
    @Body() createDto: CreateCompleteProductDto,
  ): Promise<{
    code: number;
    message: string;
    data: ProductDetailResponseDto;
  }> {
    const product = await this.productsService.createProduct(createDto);
    return {
      code: 201,
      message: '商品创建成功',
      data: product,
    };
  }

  /**
   * 获取商品列表（带分页、搜索、筛选）
   * GET /api/admin/products
   */
  @Get()
  async getProductList(
    @Query() query: QueryProductDto,
  ): Promise<{
    code: number;
    message: string;
    data: ProductListResponseDto;
  }> {
    const products = await this.productsService.getProductList(query);
    return {
      code: 200,
      message: '获取商品列表成功',
      data: products,
    };
  }

  /**
   * 搜索商品
   * GET /api/admin/products/search?keyword=关键词
   */
  @Get('search')
  async searchProducts(
    @Query('keyword') keyword: string,
    @Query('limit') limit?: string,
  ): Promise<{
    code: number;
    message: string;
    data: ProductListItemDto[];
  }> {
    const products = await this.productsService.searchProducts(
      keyword,
      limit ? parseInt(limit) : 20,
    );
    return {
      code: 200,
      message: '搜索成功',
      data: products,
    };
  }

  /**
   * 获取商品详情
   * GET /api/admin/products/:id
   */
  @Get(':id')
  async getProductDetail(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{
    code: number;
    message: string;
    data: ProductDetailResponseDto;
  }> {
    const product = await this.productsService.getProductDetail(id);
    return {
      code: 200,
      message: '获取商品详情成功',
      data: product,
    };
  }

  /**
   * 更新商品
   * PUT /api/admin/products/:id
   */
  @Put(':id')
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProductDto,
  ): Promise<{
    code: number;
    message: string;
    data: ProductDetailResponseDto;
  }> {
    const product = await this.productsService.updateProduct(id, updateDto);
    return {
      code: 200,
      message: '商品更新成功',
      data: product,
    };
  }

  /**
   * 删除商品
   * DELETE /api/admin/products/:id
   */
  @Delete(':id')
  @HttpCode(204)
  async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.productsService.deleteProduct(id);
  }
}
