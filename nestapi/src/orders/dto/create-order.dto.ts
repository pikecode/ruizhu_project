import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export class CreateOrderDto {
  @IsNumber()
  addressId: number;

  @IsString()
  @IsOptional()
  couponCode?: string;

  @IsString()
  phone: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
