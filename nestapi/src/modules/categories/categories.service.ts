import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * 获取所有分类
   */
  async getAllCategories() {
    return await this.categoryRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  /**
   * 获取分类详情
   */
  async getCategoryById(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`分类 ID ${id} 不存在`);
    }

    return category;
  }

  /**
   * 创建分类
   */
  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    iconUrl?: string;
    sortOrder?: number;
    parentId?: number;
  }) {
    // 检查 name 是否唯一
    const existing = await this.categoryRepository.findOne({
      where: { name: data.name },
    });
    if (existing) {
      throw new BadRequestException(`分类名称 "${data.name}" 已存在`);
    }

    // 检查 slug 是否唯一
    const existingSlug = await this.categoryRepository.findOne({
      where: { slug: data.slug },
    });
    if (existingSlug) {
      throw new BadRequestException(`Slug "${data.slug}" 已存在`);
    }

    // 如果设置了 parentId，检查父分类是否存在
    if (data.parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: data.parentId },
      });
      if (!parent) {
        throw new BadRequestException(`父分类 ID ${data.parentId} 不存在`);
      }
    }

    const category = this.categoryRepository.create({
      name: data.name,
      slug: data.slug,
      description: data.description,
      iconUrl: data.iconUrl,
      sortOrder: data.sortOrder || 0,
      parentId: data.parentId,
      isActive: true,
    });

    return await this.categoryRepository.save(category);
  }

  /**
   * 更新分类
   */
  async updateCategory(
    id: number,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      iconUrl?: string;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) {
    const category = await this.getCategoryById(id);

    // 检查 name 是否被其他分类使用
    if (data.name && data.name !== category.name) {
      const existing = await this.categoryRepository.findOne({
        where: { name: data.name },
      });
      if (existing) {
        throw new BadRequestException(`分类名称 "${data.name}" 已存在`);
      }
    }

    // 检查 slug 是否被其他分类使用
    if (data.slug && data.slug !== category.slug) {
      const existingSlug = await this.categoryRepository.findOne({
        where: { slug: data.slug },
      });
      if (existingSlug) {
        throw new BadRequestException(`Slug "${data.slug}" 已存在`);
      }
    }

    Object.assign(category, data);
    return await this.categoryRepository.save(category);
  }

  /**
   * 删除分类
   */
  async deleteCategory(id: number) {
    const category = await this.getCategoryById(id);
    return await this.categoryRepository.remove(category);
  }

  /**
   * 获取子分类
   */
  async getSubcategories(parentId: number) {
    return await this.categoryRepository.find({
      where: { parentId, isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }
}
