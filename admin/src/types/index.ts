// User
export interface User {
  id: string
  username: string
  email: string
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
  images?: Array<{
    id: number
    imageUrl: string
    imageType: string
    altText?: string
    sortOrder: number
    width?: number
    height?: number
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

// Order
export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  totalPrice: number
  status: OrderStatus
  shippingAddress: Address
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
