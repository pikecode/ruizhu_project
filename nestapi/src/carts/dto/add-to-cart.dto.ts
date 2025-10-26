import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class AddToCartDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  @IsOptional()
  selectedColor?: string;

  @IsString()
  @IsOptional()
  selectedSize?: string;
}

export class UpdateCartItemDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  quantity?: number;

  @IsOptional()
  isSelected?: boolean;
}
