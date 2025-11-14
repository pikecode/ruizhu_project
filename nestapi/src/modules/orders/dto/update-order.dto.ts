import { IsEnum, IsOptional, IsInt, Min, IsString, MaxLength } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'])
  status?: string;

  @IsOptional()
  remark?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  refundAmount?: number; // Refund amount in cents

  @IsOptional()
  @IsString()
  @MaxLength(100)
  trackingNumber?: string; // 快递单号
}
