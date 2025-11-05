import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

/**
 * 创建会员礼遇 DTO
 */
export class CreateMemberBenefitDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * 更新会员礼遇 DTO
 */
export class UpdateMemberBenefitDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string | null;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * 上传礼遇图片 DTO
 */
export class UploadMemberBenefitImageDto {
  // 文件将通过multipart/form-data上传
}

/**
 * 会员礼遇响应 DTO
 */
export class MemberBenefitResponseDto {
  id: number;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 会员礼遇列表响应 DTO
 */
export class MemberBenefitListResponseDto {
  items: MemberBenefitResponseDto[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
