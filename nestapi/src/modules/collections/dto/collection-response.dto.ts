/**
 * 集合响应 DTOs
 */

// 产品简化版响应（用于集合内的产品列表）
export class CollectionProductItemDto {
  id: number;
  name: string;
  subtitle?: string;
  currentPrice: number;
  originalPrice: number;
  discountRate: number;
  coverImageUrl?: string | null;
  isNew: boolean;
  isSaleOn: boolean;
  isOutOfStock: boolean;
  stockQuantity: number;
  tags?: string[];
}

// 集合详情响应（包含产品列表）
export class CollectionDetailResponseDto {
  id: number;
  name: string;
  slug?: string | null;
  description?: string;
  coverImageUrl?: string | null;
  iconUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  remark?: string;

  // 集合内的产品列表
  products?: CollectionProductItemDto[];
  productCount: number;

  createdAt: Date;
  updatedAt: Date;
}

// 集合列表项响应（首页用）
export class CollectionListItemDto {
  id: number;
  name: string;
  slug?: string | null;
  description?: string;
  coverImageUrl?: string | null;
  iconUrl?: string | null;
  sortOrder: number;
  isActive?: boolean;
  isFeatured?: boolean;
  productCount: number;

  // 集合内的前N个产品
  featuredProducts?: CollectionProductItemDto[];
}

// 集合列表响应
export class CollectionListResponseDto {
  items: CollectionListItemDto[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
