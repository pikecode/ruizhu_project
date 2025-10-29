import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  Length,
  IsInt,
  ValidateNested,
  IsArray,
  ValidateIf,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 创建商品 DTO
 */
export class CreateProductDto {
  @IsString({ message: '商品名称必须是字符串' })
  @Length(1, 200, { message: '商品名称长度必须在1-200之间' })
  name: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  subtitle?: string; // 小标题

  @IsOptional()
  sku?: string; // 商品编号

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @IsInt()
  categoryId: number;

  // 新的库存状态字段（单选）- 优先使用这个字段
  @IsOptional()
  @IsIn(['normal', 'outOfStock', 'soldOut'], { message: '库存状态必须是 normal、outOfStock 或 soldOut 之一' })
  stockStatus?: 'normal' | 'outOfStock' | 'soldOut';

  // 旧的库存状态字段（向后兼容）
  @IsOptional()
  @IsBoolean()
  isOutOfStock?: boolean = false;

  @IsOptional()
  @IsBoolean()
  isSoldOut?: boolean = false;

  @IsOptional()
  @IsBoolean()
  isNew?: boolean = false;

  @IsOptional()
  @IsBoolean()
  isSaleOn?: boolean = true;

  @IsOptional()
  @IsBoolean()
  isVipOnly?: boolean = false;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number = 0;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number = 10;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsNumber()
  shippingTemplateId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  freeShippingThreshold?: number;
}

/**
 * 创建商品价格 DTO
 */
export class CreateProductPriceDto {
  @IsNumber()
  @Min(0)
  originalPrice: number; // 原价（分）

  @IsNumber()
  @Min(0)
  currentPrice: number; // 现价（分）

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountRate?: number = 100;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string = 'CNY';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  vipDiscountRate?: number;
}

/**
 * 创建商品完整信息 DTO（包含价格等）
 *
 * 注意：
 * - 价格信息在 price 字段中提供
 * - 图片 URL 支持两种方式：url 或 coverImageUrl（这是产品缓存字段，用于快速显示列表）
 * - images 数组（存储在 product_images 表）和 coverImageUrl（产品封面缓存）是完全独立的字段，各自有各自的逻辑
 * - 这个 DTO 只处理产品基本信息和价格，不处理 images 数组
 */
export class CreateCompleteProductDto extends CreateProductDto {
  @ValidateNested()
  @Type(() => CreateProductPriceDto)
  price: CreateProductPriceDto;

  // 图片 URL（缓存字段，用于快速显示产品列表）
  // 支持两种格式：url 或 coverImageUrl
  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;
}
