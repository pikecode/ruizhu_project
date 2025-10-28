import { IsString, IsOptional, IsInt, MaxLength } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImageUrl?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
