import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Membership } from './entities/membership.entity';
import { MembershipsService } from './services/memberships.service';
import { MembershipsController } from './controllers/memberships.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Membership])],
  controllers: [MembershipsController],
  providers: [MembershipsService],
  exports: [MembershipsService],
})
export class MembershipsModule {}
