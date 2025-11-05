import { IsInt, IsOptional, Min, IsObject } from 'class-validator';

export class UpdateCartItemDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsObject()
  selectedAttributes?: Record<string, any>;
}
