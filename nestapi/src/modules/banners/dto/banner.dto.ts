import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsIn } from 'class-validator';

/**
 * 创建Banner DTO
 */
export class CreateBannerDto {
  @IsString()
  mainTitle: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['image', 'video'])
  type?: 'image' | 'video';

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(['none', 'product', 'category', 'collection', 'url'])
  linkType?: 'none' | 'product' | 'category' | 'collection' | 'url';

  @IsOptional()
  @IsString()
  linkValue?: string;
}

/**
 * 更新Banner DTO
 */
export class UpdateBannerDto {
  @IsOptional()
  @IsString()
  mainTitle?: string;

  @IsOptional()
  @IsString()
  subtitle?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsEnum(['image', 'video'])
  type?: 'image' | 'video';

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(['none', 'product', 'category', 'collection', 'url'])
  linkType?: 'none' | 'product' | 'category' | 'collection' | 'url';

  @IsOptional()
  @IsString()
  linkValue?: string | null;
}

/**
 * 上传媒体DTO
 */
export class UploadBannerMediaDto {
  @IsEnum(['image', 'video'])
  type: 'image' | 'video';

  // 文件将通过multipart/form-data上传
}

/**
 * Banner响应DTO
 */
export class BannerResponseDto {
  id: number;
  mainTitle: string;
  subtitle?: string | null;
  description?: string | null;

  type: 'image' | 'video';
  imageUrl?: string | null;
  videoUrl?: string | null;
  videoThumbnailUrl?: string | null;

  isActive: boolean;
  sortOrder: number;

  linkType: 'none' | 'product' | 'category' | 'collection' | 'url';
  linkValue?: string | null;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Banner列表响应DTO
 */
export class BannerListResponseDto {
  items: BannerResponseDto[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
