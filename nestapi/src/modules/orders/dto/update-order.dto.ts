import { IsEnum, IsOptional, IsInt, Min } from 'class-validator';

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
}
