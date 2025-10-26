import { Expose, Type } from 'class-transformer';
import { ProductImageDto } from './product-image.dto';
import { ProductVariantDto } from './product-variant.dto';

export class ProductDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  sku: string;

  @Expose()
  description: string;

  @Expose()
  shortDescription: string;

  @Expose()
  categoryId: number;

  @Expose()
  price: number;

  @Expose()
  originalPrice: number;

  @Expose()
  stock: number;

  @Expose()
  sales: number;

  @Expose()
  status: string;

  @Expose()
  rating: number;

  @Expose()
  reviewCount: number;

  @Expose()
  isFeatured: boolean;

  @Expose()
  @Type(() => ProductImageDto)
  images: ProductImageDto[];

  @Expose()
  @Type(() => ProductVariantDto)
  variants: ProductVariantDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
