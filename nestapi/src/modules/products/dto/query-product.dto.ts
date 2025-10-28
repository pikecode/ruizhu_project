import { IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 查询商品 DTO（用于分页、筛选、排序）
 */
export class QueryProductDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page: number = 1; // 页码

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit: number = 20; // 每页数量

  @IsOptional()
  @IsString()
  keyword?: string; // 搜索关键词

  @IsOptional()
  @Type(() => Number)
  categoryId?: number; // 分类筛选

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minPrice?: number; // 最低价格（分）

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number; // 最高价格（分）

  @IsOptional()
  @IsEnum(['price', 'sales', 'rating', 'created', '-price', '-sales', '-rating', '-created'])
  sort?: string = 'created'; // 排序字段: price, sales, rating, created （-表示倒序）

  @IsOptional()
  @IsString()
  @IsEnum(['true', 'false'])
  isNew?: string; // 是否新品

  @IsOptional()
  @IsString()
  @IsEnum(['true', 'false'])
  onSale?: string; // 是否上架

  @IsOptional()
  @IsString()
  @IsEnum(['true', 'false'])
  isOutOfStock?: string; // 是否缺货

  @IsOptional()
  @IsString()
  tag?: string; // 标签搜索 (new, hot, limited, discount)
}
