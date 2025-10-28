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
  UseFilters,
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

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * 创建商品
   * POST /api/v1/products
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
   * GET /api/v1/products
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
   * GET /api/v1/products/search?keyword=关键词
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
   * 获取热销商品
   * GET /api/v1/products/hot
   */
  @Get('hot')
  async getHotProducts(
    @Query('limit') limit?: string,
  ): Promise<{
    code: number;
    message: string;
    data: ProductListItemDto[];
  }> {
    const products = await this.productsService.getHotProducts(
      limit ? parseInt(limit) : 10,
    );
    return {
      code: 200,
      message: '获取热销商品成功',
      data: products,
    };
  }

  /**
   * 按分类获取商品
   * GET /api/v1/products/category/:categoryId
   */
  @Get('category/:categoryId')
  async getProductsByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Query('limit') limit?: string,
  ): Promise<{
    code: number;
    message: string;
    data: ProductListItemDto[];
  }> {
    const products = await this.productsService.getProductsByCategory(
      categoryId,
      limit ? parseInt(limit) : 12,
    );
    return {
      code: 200,
      message: '获取分类商品成功',
      data: products,
    };
  }

  /**
   * 获取商品详情
   * GET /api/v1/products/:id
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
   * PUT /api/v1/products/:id
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
   * DELETE /api/v1/products/:id
   */
  @Delete(':id')
  @HttpCode(204)
  async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.productsService.deleteProduct(id);
  }
}
