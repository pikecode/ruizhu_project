/**
 * 商品详情响应 DTO
 */
export class ProductDetailResponseDto {
  id: number;
  name: string;
  subtitle?: string;
  sku?: string | null;
  description?: string;
  categoryId: number;
  categoryName?: string;

  // 状态字段
  isNew: boolean;
  isSaleOn: boolean;
  isOutOfStock: boolean;
  isSoldOut: boolean;
  isVipOnly: boolean;

  // 库存信息
  stockQuantity: number;
  lowStockThreshold: number;

  // 物流信息
  weight?: number;
  shippingTemplateId?: number;
  freeShippingThreshold?: number;

  // 代表图片URL
  coverImageUrl?: string | null;

  // 价格信息
  price?: {
    id: number;
    originalPrice: number;
    currentPrice: number;
    discountRate: number;
    currency: string;
    vipDiscountRate?: number;
  };

  // 统计信息
  stats?: {
    salesCount: number;
    viewsCount: number;
    averageRating: number;
    reviewsCount: number;
    favoritesCount: number;
    conversionRate?: number;
  };

  // 标签
  tags: Array<{
    id: number;
    tagName: string;
  }>;

  // 时间戳
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 商品列表项响应 DTO（简化版）
 */
export class ProductListItemDto {
  id: number;
  name: string;
  subtitle?: string;
  sku?: string | null;
  categoryId: number;

  // 价格（分）
  currentPrice: number;
  originalPrice: number;
  discountRate: number;

  // 统计
  salesCount: number;
  averageRating: number;
  reviewsCount: number;

  // 状态
  isNew: boolean;
  isSaleOn: boolean;
  isOutOfStock: boolean;
  isVipOnly: boolean;

  // 库存
  stockQuantity: number;

  // 代表图片URL
  coverImageUrl?: string | null;

  // 标签
  tags?: string[];

  // 时间
  createdAt: Date;
}

/**
 * 商品列表响应 DTO
 */
export class ProductListResponseDto {
  items: ProductListItemDto[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

import { IsOptional, IsString, IsNumber, IsBoolean, IsArray, ValidateNested, IsEnum, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * 更新商品 DTO
 *
 * 说明：
 * - 所有字段都是可选的
 * - coverImageUrl 字段用于更新商品图片
 * - price 字段用于更新价格信息
 *
 * 示例请求体：
 * {
 *   "name": "更新后的商品名",
 *   "stockQuantity": 100,
 *   "coverImageUrl": "http://...",
 *   "price": {
 *     "originalPrice": 5000,
 *     "currentPrice": 3999
 *   }
 * }
 */
export class UpdateProductDto {
  // 基本信息
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  categoryId?: number;

  // 状态信息
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true' || value === '1';
    if (typeof value === 'number') return value === 1;
    return value;
  })
  @IsBoolean()
  isNew?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true' || value === '1';
    if (typeof value === 'number') return value === 1;
    return value;
  })
  @IsBoolean()
  isSaleOn?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true' || value === '1';
    if (typeof value === 'number') return value === 1;
    return value;
  })
  @IsBoolean()
  isOutOfStock?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true' || value === '1';
    if (typeof value === 'number') return value === 1;
    return value;
  })
  @IsBoolean()
  isSoldOut?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true' || value === '1';
    if (typeof value === 'number') return value === 1;
    return value;
  })
  @IsBoolean()
  isVipOnly?: boolean;

  // 库存信息
  @IsOptional()
  @IsNumber()
  stockQuantity?: number;

  @IsOptional()
  @IsNumber()
  lowStockThreshold?: number;

  // 物流信息
  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsNumber()
  shippingTemplateId?: number;

  @IsOptional()
  @IsNumber()
  freeShippingThreshold?: number;

  // 价格信息（需要特殊处理）
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  price?: {
    originalPrice?: number;
    currentPrice?: number;
    discountRate?: number;
    currency?: string;
    vipDiscountRate?: number;
  };

  // 图片URL（支持 url 或 coverImageUrl，与上传接口返回格式保持一致）
  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;
}
