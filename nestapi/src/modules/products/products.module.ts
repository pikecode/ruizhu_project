import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Product,
  ProductPrice,
  ProductImage,
  ProductStats,
  ProductAttribute,
  ProductDetails,
  ProductTag,
  ProductReview,
} from '../../entities/product.entity';
import { Category } from '../../entities/category.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductPrice,
      ProductImage,
      ProductStats,
      ProductAttribute,
      ProductDetails,
      ProductTag,
      ProductReview,
      Category,
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
