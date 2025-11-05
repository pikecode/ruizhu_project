import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberBenefit } from '../../entities/member-benefit.entity';
import { MemberBenefitsService } from './services/member-benefits.service';
import { MemberBenefitsController } from './controllers/member-benefits.controller';
import { AdminMemberBenefitsController } from './controllers/admin-member-benefits.controller';
import { MediaModule } from '../media/media.module';
import { UrlHelper } from '../../common/utils/url.helper';

@Module({
  imports: [
    TypeOrmModule.forFeature([MemberBenefit]),
    MediaModule,
  ],
  providers: [MemberBenefitsService, UrlHelper],
  controllers: [MemberBenefitsController, AdminMemberBenefitsController],
  exports: [MemberBenefitsService],
})
export class MemberBenefitsModule {}
