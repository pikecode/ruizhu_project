import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { News } from '../../entities/news.entity';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { MediaModule } from '../media/media.module';
import { UrlHelper } from '../../common/utils/url.helper';

@Module({
  imports: [TypeOrmModule.forFeature([News]), MediaModule],
  controllers: [NewsController],
  providers: [NewsService, UrlHelper],
  exports: [NewsService],
})
export class NewsModule {}
