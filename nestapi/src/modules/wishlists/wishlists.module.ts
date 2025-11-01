import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Wishlist } from '../../entities/wishlist.entity'
import { Product } from '../../entities/product.entity'
import { WishlistsService } from './wishlists.service'
import { WishlistsController } from './wishlists.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Wishlist, Product])],
  providers: [WishlistsService],
  controllers: [WishlistsController],
  exports: [WishlistsService]
})
export class WishlistsModule {}
