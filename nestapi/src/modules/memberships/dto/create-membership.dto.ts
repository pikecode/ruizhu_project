import { IsString, IsNotEmpty, Length, IsOptional, Matches, IsIn, IsDateString } from 'class-validator';

/**
 * Create Membership DTO
 * Validates membership information submission
 */
export class CreateMembershipDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['先生', '女士'])
  salutation: string; // 称谓：先生/女士

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  lastName: string; // 姓

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  firstName: string; // 名

  @IsString()
  @IsNotEmpty()
  @Matches(/^1[3-9]\d{9}$/)
  mobile: string; // 手机号（11位）

  @IsDateString()
  @IsOptional()
  birthDate?: string; // 出生日期（YYYY-MM-DD）

  @IsString()
  @IsOptional()
  @Length(1, 50)
  province?: string; // 省份

  @IsString()
  @IsOptional()
  @Length(1, 50)
  city?: string; // 城市

  @IsString()
  @IsOptional()
  @Length(1, 50)
  district?: string; // 地区

  @IsIn([0, 1, true, false])
  @IsOptional()
  requiredConsent?: number | boolean; // 隐私政策必要同意

  @IsIn([0, 1, true, false])
  @IsOptional()
  marketingConsent?: number | boolean; // 加入集团顾客数据库

  @IsIn([0, 1, true, false])
  @IsOptional()
  analysisConsent?: number | boolean; // 数据分析

  @IsIn([0, 1, true, false])
  @IsOptional()
  marketingOptionalConsent?: number | boolean; // 营销可选授权
}
