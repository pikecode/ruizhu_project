import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAddress } from './entities/user-address.entity';
import { AddressesService } from './services/addresses.service';
import { AddressesController } from './controllers/addresses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserAddress])],
  providers: [AddressesService],
  controllers: [AddressesController],
  exports: [AddressesService],
})
export class AddressesModule {}
