import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    if (!metadata.type || !metadata.metatype) {
      return value;
    }

    // 跳过原始类型
    if (
      metadata.metatype === String ||
      metadata.metatype === Number ||
      metadata.metatype === Boolean ||
      metadata.metatype === Array
    ) {
      return value;
    }

    const object = plainToInstance(metadata.metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = errors
        .map((err) => {
          const constraints = Object.values(err.constraints || {});
          return `${err.property}: ${constraints.join(', ')}`;
        })
        .join('; ');

      throw new BadRequestException({
        code: 400,
        message: '数据验证失败',
        details: messages,
      });
    }

    return object;
  }
}
