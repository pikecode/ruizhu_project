import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegionsController } from './regions.controller';
import { AdminRegionsController } from './admin-regions.controller';
import { RegionsService } from './regions.service';
import { Province } from '../../entities/province.entity';
import { City } from '../../entities/city.entity';
import { District } from '../../entities/district.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Province, City, District])],
  controllers: [RegionsController, AdminRegionsController],
  providers: [RegionsService],
  exports: [RegionsService],
})
export class RegionsModule {}
