import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto, ProductDto } from './dto';
import { Product } from './entities/product.entity';

@Controller('products')
@UseInterceptors(ClassSerializerInterceptor)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * 获取产品列表
   * GET /products?categoryId=1&page=1&limit=20&sort=price&order=asc
   */
  @Get()
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  /**
   * 搜索产品
   * GET /products/search?q=连衣裙&limit=10
   */
  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('limit') limit: number = 10,
  ) {
    if (!query) {
      return [];
    }
    return this.productsService.search(query, limit);
  }

  /**
   * 获取精选产品
   * GET /products/featured?limit=10
   */
  @Get('featured')
  async getFeatured(@Query('limit') limit: number = 10) {
    return this.productsService.getFeatured(limit);
  }

  /**
   * 按分类获取产品
   * GET /products/category/:categoryId
   */
  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId') categoryId: number) {
    return this.productsService.findByCategory(categoryId);
  }

  /**
   * 获取单个产品详情
   * GET /products/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ProductDto> {
    return this.productsService.findOne(id);
  }

  /**
   * 创建产品（管理员）
   * POST /products
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  /**
   * 更新产品（管理员）
   * PATCH /products/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  /**
   * 删除产品（管理员）
   * DELETE /products/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: number): Promise<void> {
    await this.productsService.remove(id);
  }

  /**
   * 添加产品图片（管理员）
   * POST /products/:id/images
   */
  @Post(':id/images')
  async addImage(
    @Param('id') productId: number,
    @Body() body: { imageUrl: string; isThumbnail?: boolean },
  ) {
    return this.productsService.addImage(productId, body.imageUrl, body.isThumbnail);
  }

  /**
   * 删除产品图片（管理员）
   * DELETE /products/images/:imageId
   */
  @Delete('images/:imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeImage(@Param('imageId') imageId: number): Promise<void> {
    await this.productsService.removeImage(imageId);
  }

  /**
   * 添加产品变体（管理员）
   * POST /products/:id/variants
   */
  @Post(':id/variants')
  async addVariant(
    @Param('id') productId: number,
    @Body()
    body: {
      color?: string;
      size?: string;
      stock?: number;
      priceAdjustment?: number;
    },
  ) {
    return this.productsService.addVariant(
      productId,
      body.color,
      body.size,
      body.stock,
      body.priceAdjustment,
    );
  }
}
