import { IsString, IsOptional, Length, Matches, IsIn, IsDateString } from 'class-validator';

/**
 * Update Membership DTO - All fields are optional
 */
export class UpdateMembershipDto {
  @IsString()
  @IsOptional()
  @IsIn(['先生', '女士'])
  salutation?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  lastName?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  firstName?: string;

  @IsString()
  @IsOptional()
  @Matches(/^1[3-9]\d{9}$/)
  mobile?: string;

  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  province?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  city?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  district?: string;

  @IsIn([0, 1, true, false])
  @IsOptional()
  requiredConsent?: number | boolean;

  @IsIn([0, 1, true, false])
  @IsOptional()
  marketingConsent?: number | boolean;

  @IsIn([0, 1, true, false])
  @IsOptional()
  analysisConsent?: number | boolean;

  @IsIn([0, 1, true, false])
  @IsOptional()
  marketingOptionalConsent?: number | boolean;
}
