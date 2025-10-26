import { Expose } from 'class-transformer';

export class ProductImageDto {
  @Expose()
  id: number;

  @Expose()
  productId: number;

  @Expose()
  imageUrl: string;

  @Expose()
  displayOrder: number;

  @Expose()
  isThumbnail: boolean;

  @Expose()
  createdAt: Date;
}
