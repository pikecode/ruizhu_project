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
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  images: string[]
  createdAt: string
  updatedAt: string
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
