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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { AdminAuthGuard } from '../../auth/guards/admin-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { PRODUCT_PERMISSIONS } from '../../auth/constants/permissions';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import {
  CreateCompleteProductDto,
  QueryProductDto,
  UpdateProductDto,
  AddProductImageDto,
  UpdateProductImageDto,
  UpdateProductImagesSortDto,
} from './dto';
import {
  ProductDetailResponseDto,
  ProductListResponseDto,
  ProductListItemDto,
  ProductImageDto,
} from './dto/product-response.dto';

/**
 * Admin 产品管理控制器
 * 路由前缀: /api/admin/products
 * 权限控制: 所有路由都需要管理员登录 + 相应权限
 */
@Controller('admin/products')
@UseGuards(AdminAuthGuard, RolesGuard)
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * 创建商品
   * POST /api/admin/products
   * 权限: 只有 admin 和 manager 可以创建
   */
  @Post()
  @HttpCode(201)
  @Roles('admin', 'manager')
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
   * 权限: 所有管理员都可以查看
   */
  @Get()
  @Roles('admin', 'manager', 'operator')
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
   * 权限: 所有管理员都可以搜索
   */
  @Get('search')
  @Roles('admin', 'manager', 'operator')
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
   * 权限: 所有管理员都可以查看详情
   */
  @Get(':id')
  @Roles('admin', 'manager', 'operator')
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
   * 权限: 只有 admin 和 manager 可以更新
   */
  @Put(':id')
  @Roles('admin', 'manager')
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
   * 权限: 只有 admin 可以删除
   */
  @Delete(':id')
  @HttpCode(204)
  @Roles('admin')
  async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.productsService.deleteProduct(id);
  }

  /**
   * 添加商品图片
   * POST /api/admin/products/:id/images
   * 权限: 只有 admin 和 manager 可以添加
   */
  @Post(':id/images')
  @HttpCode(201)
  @Roles('admin', 'manager')
  async addProductImage(
    @Param('id', ParseIntPipe) id: number,
    @Body() addImageDto: AddProductImageDto,
  ): Promise<{
    code: number;
    message: string;
    data: ProductImageDto;
  }> {
    const image = await this.productsService.addProductImage(id, addImageDto);
    return {
      code: 201,
      message: '图片添加成功',
      data: image,
    };
  }

  /**
   * 获取商品的所有图片
   * GET /api/admin/products/:id/images
   * 权限: 所有管理员都可以查看
   */
  @Get(':id/images')
  @Roles('admin', 'manager', 'operator')
  async getProductImages(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{
    code: number;
    message: string;
    data: ProductImageDto[];
  }> {
    const product = await this.productsService.getProductDetail(id);
    return {
      code: 200,
      message: '获取图片列表成功',
      data: product.images || [],
    };
  }

  /**
   * 更新商品图片
   * PUT /api/admin/products/:id/images/:imageId
   * 权限: 只有 admin 和 manager 可以更新
   */
  @Put(':id/images/:imageId')
  @Roles('admin', 'manager')
  async updateProductImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
    @Body() updateImageDto: UpdateProductImageDto,
  ): Promise<{
    code: number;
    message: string;
    data: ProductImageDto;
  }> {
    const image = await this.productsService.updateProductImage(id, imageId, updateImageDto);
    return {
      code: 200,
      message: '图片更新成功',
      data: image,
    };
  }

  /**
   * 删除商品图片
   * DELETE /api/admin/products/:id/images/:imageId
   * 权限: 只有 admin 可以删除
   */
  @Delete(':id/images/:imageId')
  @HttpCode(204)
  @Roles('admin')
  async deleteProductImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ): Promise<void> {
    await this.productsService.deleteProductImage(id, imageId);
  }

  /**
   * 批量更新商品图片顺序
   * PUT /api/admin/products/:id/images/sort
   * 权限: 只有 admin 和 manager 可以更新
   */
  @Put(':id/images/sort')
  @Roles('admin', 'manager')
  async updateProductImagesSort(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSortDto: UpdateProductImagesSortDto,
  ): Promise<{
    code: number;
    message: string;
    data: ProductImageDto[];
  }> {
    const images = await this.productsService.updateProductImagesSort(id, updateSortDto);
    return {
      code: 200,
      message: '图片顺序更新成功',
      data: images,
    };
  }
}
