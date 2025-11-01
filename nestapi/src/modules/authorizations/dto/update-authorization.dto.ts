import { IsIn, IsOptional } from 'class-validator';

/**
 * Update Authorization DTO
 * All fields are optional for flexible updates
 */
export class UpdateAuthorizationDto {
  @IsIn([0, 1, true, false])
  @IsOptional()
  registration?: number | boolean;

  @IsIn([0, 1, true, false])
  @IsOptional()
  analysis?: number | boolean;

  @IsIn([0, 1, true, false])
  @IsOptional()
  marketing?: number | boolean;

  @IsIn([0, 1, true, false])
  @IsOptional()
  transfer?: number | boolean;
}
