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

  @IsOptional()
  @IsBoolean()
  isNew?: boolean = false;

  @IsOptional()
  @IsBoolean()
  isSaleOn?: boolean = true;

  @IsOptional()
  @IsBoolean()
  isOutOfStock?: boolean = false;

  @IsOptional()
  @IsBoolean()
  isSoldOut?: boolean = false;

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
 * 创建商品完整信息 DTO（包含价格、图片等）
 *
 * 注意：图片 URL 支持两个字段：
 * - url: 与上传接口返回格式保持一致（推荐）
 * - coverImageUrl: 向后兼容
 */
export class CreateCompleteProductDto extends CreateProductDto {
  @ValidateNested()
  @Type(() => CreateProductPriceDto)
  price: CreateProductPriceDto;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;
}
