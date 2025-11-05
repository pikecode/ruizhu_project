import { IsNumber, IsPositive, IsObject, IsOptional, Min } from 'class-validator';

/**
 * DTO for items in checkout request
 * Represents a product being ordered from the cart
 */
export class CheckoutItemDto {
  @IsNumber()
  @IsPositive()
  productId: number;

  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;

  @IsNumber()
  @IsPositive()
  price: number; // Price per unit in cents

  @IsObject()
  @IsOptional()
  selectedAttributes?: Record<string, any>; // Product variants (color, size, etc.)
}
