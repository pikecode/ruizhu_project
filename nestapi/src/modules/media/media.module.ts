import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { CosService } from '../../common/services/cos.service';

@Module({
  imports: [ConfigModule],
  controllers: [MediaController],
  providers: [MediaService, CosService],
  exports: [MediaService, CosService],
})
export class MediaModule {}
