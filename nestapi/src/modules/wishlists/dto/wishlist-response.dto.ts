import { Expose } from 'class-transformer'

export class WishlistProductDto {
  @Expose()
  id: number

  @Expose()
  name: string

  @Expose()
  coverImageUrl: string

  @Expose()
  currentPrice: number

  @Expose()
  originalPrice?: number

  @Expose()
  discountRate?: number
}

export class WishlistResponseDto {
  @Expose()
  id: number

  @Expose()
  productId: number

  @Expose()
  product: WishlistProductDto

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date
}
