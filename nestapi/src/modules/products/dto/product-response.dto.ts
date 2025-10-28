/**
 * 商品详情响应 DTO
 */
export class ProductDetailResponseDto {
  id: number;
  name: string;
  subtitle?: string;
  sku: string;
  description?: string;
  categoryId: number;
  categoryName?: string;

  // 状态字段
  isNew: boolean;
  isSaleOn: boolean;
  isOutOfStock: boolean;
  isSoldOut: boolean;
  isVipOnly: boolean;

  // 库存信息
  stockQuantity: number;
  lowStockThreshold: number;

  // 物流信息
  weight?: number;
  shippingTemplateId?: number;
  freeShippingThreshold?: number;

  // 价格信息
  price?: {
    id: number;
    originalPrice: number;
    currentPrice: number;
    discountRate: number;
    currency: string;
    vipDiscountRate?: number;
  };

  // 统计信息
  stats?: {
    salesCount: number;
    viewsCount: number;
    averageRating: number;
    reviewsCount: number;
    favoritesCount: number;
    conversionRate?: number;
  };

  // 图片
  images: Array<{
    id: number;
    imageUrl: string;
    imageType: string;
    altText?: string;
    sortOrder: number;
    width?: number;
    height?: number;
  }>;

  // 标签
  tags: Array<{
    id: number;
    tagName: string;
  }>;

  // 时间戳
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 商品列表项响应 DTO（简化版）
 */
export class ProductListItemDto {
  id: number;
  name: string;
  subtitle?: string;
  sku: string;
  categoryId: number;

  // 价格（分）
  currentPrice: number;
  originalPrice: number;
  discountRate: number;

  // 统计
  salesCount: number;
  averageRating: number;
  reviewsCount: number;

  // 状态
  isNew: boolean;
  isSaleOn: boolean;
  isOutOfStock: boolean;
  isVipOnly: boolean;

  // 库存
  stockQuantity: number;

  // 第一张图片
  coverImage?: string;

  // 标签
  tags?: string[];

  // 时间
  createdAt: Date;
}

/**
 * 商品列表响应 DTO
 */
export class ProductListResponseDto {
  items: ProductListItemDto[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * 更新商品 DTO - 接受任意更新字段，全部可选
 */
export class UpdateProductDto {
  [key: string]: any;
}
