import { IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 查询咨询DTO
 */
export class QueryConsultationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(['unread', 'read', 'processing', 'completed'])
  status?: 'unread' | 'read' | 'processing' | 'completed';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  productId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  keyword?: string; // 按电话或用户名搜索
}
