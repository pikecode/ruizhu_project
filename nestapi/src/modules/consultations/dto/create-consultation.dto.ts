import { IsString, IsEmail, IsNumber, IsOptional, MinLength, MaxLength } from 'class-validator';

/**
 * 创建咨询DTO
 */
export class CreateConsultationDto {
  @IsNumber()
  productId: number;

  @IsString()
  @MaxLength(255)
  productName: string;

  @IsNumber()
  categoryId: number;

  @IsString()
  @MaxLength(100)
  categoryName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  userName: string;

  @IsString()
  @MinLength(11)
  @MaxLength(20)
  userPhone: string;

  @IsEmail()
  @IsOptional()
  userEmail?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  color?: string;

  // 服装相关字段
  @IsString()
  @IsOptional()
  height?: string;

  @IsString()
  @IsOptional()
  weight?: string;

  @IsString()
  @IsOptional()
  chest?: string;

  @IsString()
  @IsOptional()
  waist?: string;

  @IsString()
  @IsOptional()
  hip?: string;

  // 鞋履相关字段
  @IsString()
  @IsOptional()
  shoeSize?: string;

  // 珠宝相关字段
  @IsString()
  @IsOptional()
  ringSize?: string;

  @IsString()
  @IsOptional()
  jewelrySize?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  jewelryMaterial?: string;

  // 香水相关字段
  @IsString()
  @IsOptional()
  @MaxLength(100)
  perfumePreference?: string;

  // 通用字段
  @IsString()
  @IsOptional()
  remarks?: string;
}
