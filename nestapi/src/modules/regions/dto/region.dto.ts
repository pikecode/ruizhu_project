import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Province DTOs
export class CreateProvinceDto {
  @ApiProperty({ description: '省份名称', example: '北京市' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '省份代码', example: 'BJ' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ description: '排序顺序', example: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateProvinceDto {
  @ApiPropertyOptional({ description: '省份名称', example: '北京市' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '省份代码', example: 'BJ' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: '排序顺序', example: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class ProvinceResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ProvinceListResponseDto {
  @ApiProperty({ type: [ProvinceResponseDto] })
  items: ProvinceResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  pages: number;
}

// City DTOs
export class CreateCityDto {
  @ApiProperty({ description: '城市名称', example: '朝阳区' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '城市代码', example: 'CITY_01' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: '所属省份ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  provinceId: number;

  @ApiPropertyOptional({ description: '排序顺序', example: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateCityDto {
  @ApiPropertyOptional({ description: '城市名称', example: '朝阳区' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '城市代码', example: 'CITY_01' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: '所属省份ID', example: 1 })
  @IsOptional()
  @IsNumber()
  provinceId?: number;

  @ApiPropertyOptional({ description: '排序顺序', example: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CityResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  provinceId: number;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CityListResponseDto {
  @ApiProperty({ type: [CityResponseDto] })
  items: CityResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  pages: number;
}

// District DTOs
export class CreateDistrictDto {
  @ApiProperty({ description: '地区名称', example: '建国门街道' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '地区代码', example: 'DIST_01' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: '所属城市ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  cityId: number;

  @ApiPropertyOptional({ description: '排序顺序', example: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateDistrictDto {
  @ApiPropertyOptional({ description: '地区名称', example: '建国门街道' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '地区代码', example: 'DIST_01' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: '所属城市ID', example: 1 })
  @IsOptional()
  @IsNumber()
  cityId?: number;

  @ApiPropertyOptional({ description: '排序顺序', example: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class DistrictResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  cityId: number;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class DistrictListResponseDto {
  @ApiProperty({ type: [DistrictResponseDto] })
  items: DistrictResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  pages: number;
}
