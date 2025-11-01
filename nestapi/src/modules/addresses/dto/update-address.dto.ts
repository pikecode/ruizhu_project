import { IsString, IsOptional, Length, Matches, IsIn } from 'class-validator';

/**
 * Update Address DTO - All fields are optional
 */
export class UpdateAddressDto {
  @IsString()
  @IsOptional()
  @Length(1, 100)
  receiverName?: string;

  @IsString()
  @IsOptional()
  @Matches(/^1[3-9]\d{9}$/)
  receiverPhone?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  province?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  city?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  district?: string;

  @IsString()
  @IsOptional()
  addressDetail?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{6}$/)
  postalCode?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  label?: string;

  @IsIn([0, 1, true, false])
  @IsOptional()
  isDefault?: number | boolean;
}
