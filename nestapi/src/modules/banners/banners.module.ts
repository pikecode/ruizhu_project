import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Banner } from '../../entities/banner.entity';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { AdminBannersController } from './admin-banners.controller';
import { MediaModule } from '../media/media.module';
import { UrlHelper } from '../../common/utils/url.helper';

@Module({
  imports: [TypeOrmModule.forFeature([Banner]), MediaModule, ConfigModule],
  controllers: [BannersController, AdminBannersController],
  providers: [BannersService, UrlHelper],
  exports: [BannersService],
})
export class BannersModule {}
