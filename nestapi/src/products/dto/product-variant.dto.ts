import { Expose } from 'class-transformer';

export class ProductVariantDto {
  @Expose()
  id: number;

  @Expose()
  productId: number;

  @Expose()
  name: string;

  @Expose()
  color: string;

  @Expose()
  size: string;

  @Expose()
  priceAdjustment: number;

  @Expose()
  variantSku: string;

  @Expose()
  stock: number;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
