import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { File } from './entities/file.entity';
import { FilesService } from './services/files.service';
import { CosService } from './services/cos.service';
import { FilesController } from './controllers/files.controller';

@Module({
  imports: [TypeOrmModule.forFeature([File]), ConfigModule],
  providers: [FilesService, CosService],
  controllers: [FilesController],
  exports: [FilesService, CosService],
})
export class FilesModule {}
