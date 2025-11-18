// User
export interface User {
  id: string
  username: string
  email: string
  nickname?: string
  status?: string
  role: Role
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: string
  description?: string
  permissions: Permission[]
}

export interface Permission {
  id: string
  name: string
  resource: string
  action: string
}

// Product
export interface Product {
  id: number
  name: string
  subtitle?: string
  sku: string
  description?: string
  categoryId: number
  categoryName?: string
  productType?: 'standard' | 'custom' | 'vip_recharge' // 产品类型
  discount?: number // VIP 折扣倍数（仅限充值产品）
  // Status fields
  isNew: boolean
  isSaleOn: boolean
  isOutOfStock: boolean
  isSoldOut: boolean
  isVipOnly: boolean
  // Stock
  stockQuantity: number
  lowStockThreshold: number
  // Shipping
  weight?: number
  shippingTemplateId?: number
  freeShippingThreshold?: number
  // Price
  price?: {
    id: number
    originalPrice: number
    currentPrice: number
    discountRate: number
    currency: string
    vipDiscountRate?: number
  }
  // Stats
  stats?: {
    salesCount: number
    viewsCount: number
    averageRating: number
    reviewsCount: number
    favoritesCount: number
    conversionRate?: number
  }
  // Images
  coverImageUrl?: string | null
  images?: Array<{
    id: number
    imageUrl: string
    imageType: string
    altText?: string
    sortOrder: number
    width?: number
    height?: number
    fileSize?: number
  }>
  // Tags
  tags?: Array<{
    id: number
    tagName: string
  }>
  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface ProductListItem extends Omit<Product, 'images' | 'tags'> {
  coverImageUrl?: string | null
  tags?: string[]
  currentPrice: number
  originalPrice: number
  discountRate: number
  salesCount: number
  averageRating: number
  reviewsCount: number
  discount?: number // VIP 折扣倍数
}

export interface Category {
  id: number
  name: string
  slug?: string
  icon?: string
  description?: string
  sortOrder?: number
  isActive?: boolean
  parentId?: number
  createdAt?: string
  updatedAt?: string
}

// Collection
export interface Collection {
  id: number
  name: string
  slug: string
  description?: string
  coverImageUrl?: string | null
  iconUrl?: string | null
  sortOrder: number
  isActive: boolean
  isFeatured: boolean
  remark?: string
  createdAt: string
  updatedAt: string
}

export interface CollectionListItem extends Collection {
  productCount: number
}

export interface CollectionDetail extends Collection {
  products?: ProductListItem[]
  productCount: number
}

// Array Collection
export interface ArrayCollection {
  id: number
  title: string
  slug?: string | null
  description?: string
  sortOrder: number
  isActive: boolean
  remark?: string
  createdAt: string
  updatedAt: string
}

// Order
export interface Order {
  id: string
  userId: string
  user?: {
    id: number
    nickname?: string
    phone?: string
    email?: string
  }
  items: OrderItem[]
  totalPrice: number
  totalAmount?: number
  status: OrderStatus
  shippingAddress: Address
  productIds?: string  // 多个产品ID用分号分隔，例如: "1;2;3"
  trackingNumber?: string  // 快递单号
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

// Auth
export interface LoginPayload {
  username: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

// API Response
export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
}

// Member Benefits
export interface MemberBenefit {
  id: number
  title: string
  subtitle?: string | null
  imageUrl?: string | null
  imageKey?: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface MemberBenefitListItem extends Omit<MemberBenefit, 'imageKey'> {
  // 列表项特有字段
}

// Pagination
export interface PaginationParams {
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginationResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
