import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * 获取所有分类
   * GET /api/v1/categories
   */
  @Get()
  async getAllCategories(): Promise<{
    code: number;
    message: string;
    data: any[];
  }> {
    const categories = await this.categoriesService.getAllCategories();
    return {
      code: 200,
      message: '获取分类列表成功',
      data: categories,
    };
  }

  /**
   * 获取分类详情
   * GET /api/v1/categories/:id
   */
  @Get(':id')
  async getCategoryById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{
    code: number;
    message: string;
    data: any;
  }> {
    const category = await this.categoriesService.getCategoryById(id);
    return {
      code: 200,
      message: '获取分类详情成功',
      data: category,
    };
  }

  /**
   * 获取子分类
   * GET /api/v1/categories/:id/subcategories
   */
  @Get(':id/subcategories')
  async getSubcategories(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{
    code: number;
    message: string;
    data: any[];
  }> {
    const subcategories = await this.categoriesService.getSubcategories(id);
    return {
      code: 200,
      message: '获取子分类成功',
      data: subcategories,
    };
  }

  /**
   * 创建分类
   * POST /api/v1/categories
   */
  @Post()
  @HttpCode(201)
  async createCategory(
    @Body()
    data: {
      name: string;
      slug: string;
      description?: string;
      iconUrl?: string;
      sortOrder?: number;
      parentId?: number;
    },
  ): Promise<{
    code: number;
    message: string;
    data: any;
  }> {
    const category = await this.categoriesService.createCategory(data);
    return {
      code: 201,
      message: '分类创建成功',
      data: category,
    };
  }

  /**
   * 更新分类
   * PUT /api/v1/categories/:id
   */
  @Put(':id')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    data: {
      name?: string;
      slug?: string;
      description?: string;
      iconUrl?: string;
      sortOrder?: number;
      isActive?: boolean;
    },
  ): Promise<{
    code: number;
    message: string;
    data: any;
  }> {
    const category = await this.categoriesService.updateCategory(id, data);
    return {
      code: 200,
      message: '分类更新成功',
      data: category,
    };
  }

  /**
   * 删除分类
   * DELETE /api/v1/categories/:id
   */
  @Delete(':id')
  @HttpCode(204)
  async deleteCategory(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.categoriesService.deleteCategory(id);
  }
}
