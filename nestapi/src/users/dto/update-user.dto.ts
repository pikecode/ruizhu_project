import { IsOptional, IsNumber, Min, Max, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(1.0)
  discount?: number;

  @IsOptional()
  @IsString()
  status?: 'active' | 'banned' | 'deleted';
}
