import { IsInt, IsOptional, Min, IsObject } from 'class-validator';

export class CreateCartItemDto {
  @IsInt()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number = 1;

  @IsOptional()
  @IsObject()
  selectedAttributes?: Record<string, any>;

  /**
   * Optional price snapshot in cents
   * If not provided, will be fetched from current product price
   */
  @IsOptional()
  @IsInt()
  priceSnapshot?: number;
}
