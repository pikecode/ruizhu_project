import { IsOptional, IsNumber, Min, Max, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  email?: string;

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
