import { IsString, IsOptional, IsBoolean, IsNumber, Length, IsIn } from 'class-validator';
import { VALID_COLLECTION_SLUGS } from '../../../constants/collection-slugs';

/**
 * 创建集合 DTO
 *
 * 注意：
 * - Slug 可选，若未提供则使用默认值
 * - Slug 必须从预定义的列表中选择
 * - 每个 slug 代表小程序首页的一个固定位置
 * - 一旦创建就不能改
 */
export class CreateCollectionDto {
  @IsString({ message: '集合名称必须是字符串' })
  @Length(1, 100, { message: '集合名称长度必须在1-100之间' })
  name: string; // 集合名称

  @IsOptional()
  @IsString({ message: 'slug必须是字符串' })
  @IsIn(VALID_COLLECTION_SLUGS, {
    message: `slug 必须是以下值之一: ${VALID_COLLECTION_SLUGS.join(', ')}`,
  })
  slug?: string; // URL友好的标识（从预定义列表中选择，可选，不提供时集合不会显示在固定位置）

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
