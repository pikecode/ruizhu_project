import { IsInt, Min, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsInt()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsInt()
  @Min(0)
  price: number; // Price in cents

  @IsOptional()
  selectedAttributes?: Record<string, any>;
}

export class CreateOrderDto {
  @IsOptional()
  @IsInt()
  addressId?: number; // Delivery address ID (optional for recharge orders)

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsInt()
  @Min(0)
  totalAmount: number; // Total amount in cents

  @IsOptional()
  @IsInt()
  @Min(0)
  shippingAmount?: number = 0; // Shipping cost in cents

  @IsOptional()
  @IsInt()
  @Min(0)
  discountAmount?: number = 0; // Discount amount in cents

  @IsInt()
  @Min(0)
  finalAmount: number; // Final amount to pay in cents (totalAmount + shippingAmount - discountAmount)

  @IsOptional()
  remark?: string; // Order remark/notes

  @IsOptional()
  isRecharge?: boolean; // Whether this is a recharge order
}
