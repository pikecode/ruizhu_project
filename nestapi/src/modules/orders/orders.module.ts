import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, OrderItem, Product } from '../../entities/product.entity';
import { User } from '../../entities/user.entity';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './controllers/orders.controller';
import { AdminOrdersController } from './controllers/admin-orders.controller';
import { AddressesModule } from '../addresses/addresses.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product, User]), AddressesModule],
  providers: [OrdersService],
  controllers: [OrdersController, AdminOrdersController],
  exports: [OrdersService, TypeOrmModule],
})
export class OrdersModule {}
