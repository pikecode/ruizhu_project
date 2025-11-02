import { IsString, IsOptional, IsBoolean, IsNumber, Length } from 'class-validator';

/**
 * 创建集合 DTO
 */
export class CreateCollectionDto {
  @IsString({ message: '集合名称必须是字符串' })
  @Length(1, 100, { message: '集合名称长度必须在1-100之间' })
  name: string; // 集合名称

  @IsOptional()
  @IsString({ message: 'slug必须是字符串' })
  @Length(0, 100, { message: 'slug长度不能超过100' })
  slug?: string; // URL友好的标识，可选

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string; // 集合描述

  @IsOptional()
  @IsString()
  @Length(0, 500, { message: '封面图片URL长度不能超过500' })
  coverImageUrl?: string; // 集合封面图片

  @IsOptional()
  @IsString()
  @Length(0, 255, { message: '图标URL长度不能超过255' })
  iconUrl?: string; // 集合图标

  @IsOptional()
  @IsNumber()
  sortOrder?: number; // 显示顺序，可选

  @IsOptional()
  @IsBoolean()
  isActive?: boolean; // 是否激活，可选

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean = false; // 是否在首页展示

  @IsOptional()
  @IsString()
  remark?: string; // 备注说明
}
