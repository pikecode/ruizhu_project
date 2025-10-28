import { IsString, IsOptional, IsBoolean, IsNumber, Length } from 'class-validator';

/**
 * 更新集合 DTO
 *
 * 注意：
 * - Slug 在创建时设置，之后不可修改（用于小程序端 URL）
 * - 本 DTO 不包含 slug 字段，确保 slug 不会被意外修改
 * - 后台通过 Collection ID 来标识和更新集合
 * - Slug 代表小程序首页的固定位置，改了会破坏小程序 URL
 */
export class UpdateCollectionDto {
  @IsOptional()
  @IsString()
  @Length(1, 100, { message: '集合名称长度必须在1-100之间' })
  name?: string; // 集合名称

  // ✋ Slug 已完全移除：不允许修改

  @IsOptional()
  @IsString()
  @Length(0, 500, { message: '集合描述长度不能超过500个字符' })
  description?: string; // 集合描述

  @IsOptional()
  @IsString()
  @Length(0, 500)
  coverImageUrl?: string; // 集合封面图片

  @IsOptional()
  @IsString()
  @Length(0, 255)
  iconUrl?: string; // 集合图标

  @IsOptional()
  @IsNumber()
  sortOrder?: number; // 显示顺序

  @IsOptional()
  @IsBoolean()
  isActive?: boolean; // 是否激活

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean; // 是否在首页展示

  @IsOptional()
  @IsString()
  remark?: string; // 备注说明
}
