import { IsString, IsNotEmpty, Length, IsOptional, Matches } from 'class-validator';

/**
 * Create Address DTO
 */
export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  receiverName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^1[3-9]\d{9}$/)
  receiverPhone: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  province: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  city: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  district?: string;

  @IsString()
  @IsNotEmpty()
  addressDetail: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{6}$/)
  postalCode?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  label?: string;
}
