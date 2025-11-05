export class ArrayCollectionItemProductDto {
  id: number;
  name: string;
  subtitle?: string;
  sku: string;
  coverImageUrl: string;
  isNew: boolean;
  isSaleOn: boolean;
  isOutOfStock: boolean;
  stockQuantity: number;
  currentPrice: number;
  originalPrice: number;
  discountRate: number;
  tags: string[];
}

export class ArrayCollectionItemDto {
  id: number;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  sortOrder: number;
  products?: ArrayCollectionItemProductDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class ArrayCollectionDetailResponseDto {
  id: number;
  title: string;
  slug?: string | null;
  description: string;
  sortOrder: number;
  isActive: boolean;
  items: ArrayCollectionItemDto[];
  itemCount: number;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ArrayCollectionListResponseDto {
  items: ArrayCollectionDetailResponseDto[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
