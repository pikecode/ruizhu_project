import { IsOptional, IsNumber, Min, Max, IsString, IsIn, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsIn(['male', 'female', 'unknown'])
  gender?: 'male' | 'female' | 'unknown';

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsDateString()
  birthday?: string;

  @IsOptional()
  @Transform(({ value }) => {
    // 处理布尔值，支持 1/0, true/false, 'true'/'false' 等形式
    if (typeof value === 'string') {
      return value === '1' || value === 'true' || value === 'True';
    }
    if (typeof value === 'number') {
      return value === 1;
    }
    return Boolean(value);
  })
  isProfileAuthorized?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    // 将字符串转换为数字
    if (typeof value === 'string') {
      return parseFloat(value);
    }
    return value;
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: '折扣倍数必须是数字，最多两位小数',
    }
  )
  @Min(0.01, {
    message: '折扣倍数不能小于 0.01',
  })
  @Max(1.0, {
    message: '折扣倍数不能大于 1.0',
  })
  discount?: number;

  @IsOptional()
  @IsString()
  status?: 'active' | 'banned' | 'deleted';
}
