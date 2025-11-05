import {
  IsArray,
  IsNumber,
  IsPositive,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CheckoutItemDto } from './checkout-item.dto';

/**
 * DTO for checkout request
 * Contains items from cart and delivery address
 */
export class CheckoutDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[]; // Cart items to checkout

  @IsNumber()
  @IsPositive()
  addressId: number; // Delivery address ID

  @IsNumber()
  @IsOptional()
  shippingAmount?: number; // Shipping cost in cents (optional, default 0)

  @IsNumber()
  @IsOptional()
  discountAmount?: number; // Discount amount in cents (optional, default 0)

  @IsOptional()
  remark?: string; // Order remark/notes
}
