import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArrayCollection } from '../../entities/array-collection.entity';
import { ArrayCollectionItem } from '../../entities/array-collection-item.entity';
import { ArrayCollectionItemProduct } from '../../entities/array-collection-item-product.entity';
import { ArrayCollectionsService } from './array-collections.service';
import { ArrayCollectionsController } from './array-collections.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ArrayCollection,
      ArrayCollectionItem,
      ArrayCollectionItemProduct,
    ]),
  ],
  controllers: [ArrayCollectionsController],
  providers: [ArrayCollectionsService],
  exports: [ArrayCollectionsService],
})
export class ArrayCollectionsModule {}
