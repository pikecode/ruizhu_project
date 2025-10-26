import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ProductStatus } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  sku: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsNumber()
  categoryId: number;

  @IsNumber()
  price: number;

  @IsNumber()
  @IsOptional()
  originalPrice?: number;

  @IsNumber()
  @IsOptional()
  stock?: number = 0;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus = ProductStatus.ACTIVE;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean = false;

  @IsNumber()
  @IsOptional()
  displayOrder?: number = 0;
}
