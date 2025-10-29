/**
 * 商品相关的 TypeORM 实体定义
 * 用于与数据库表对应
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  Index,
  Unique,
  JoinColumn,
} from 'typeorm';

/**
 * 商品实体
 */
@Entity('products')
@Index(['category'])
@Index(['isSaleOn', 'stockStatus'])
@Index(['stockStatus'])
@Index(['createdAt'])
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  name: string; // 大标题

  @Column({ type: 'varchar', length: 200, nullable: true })
  subtitle: string; // 小标题

  @Column({ type: 'varchar', length: 100, nullable: true })
  sku: string | null;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', name: 'category_id' })
  categoryId: number;

  @Column({ type: 'tinyint', default: 0, name: 'is_new' })
  isNew: boolean;

  @Column({ type: 'tinyint', default: 1, name: 'is_sale_on' })
  isSaleOn: boolean;

  @Column({ type: 'tinyint', default: 0, name: 'is_out_of_stock' })
  isOutOfStock: boolean;

  @Column({ type: 'tinyint', default: 0, name: 'is_sold_out' })
  isSoldOut: boolean;

  @Column({
    type: 'enum',
    enum: ['normal', 'outOfStock', 'soldOut'],
    default: 'normal',
    name: 'stock_status',
  })
  stockStatus: 'normal' | 'outOfStock' | 'soldOut';

  @Column({ type: 'tinyint', default: 0, name: 'is_vip_only' })
  isVipOnly: boolean;

  @Column({ type: 'int', default: 0, name: 'stock_quantity' })
  stockQuantity: number;

  @Column({ type: 'int', default: 10, name: 'low_stock_threshold' })
  lowStockThreshold: number;

  @Column({ type: 'int', nullable: true })
  weight: number; // 克

  @Column({ type: 'int', nullable: true, name: 'shipping_template_id' })
  shippingTemplateId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'free_shipping_threshold' })
  freeShippingThreshold: number; // 元

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'cover_image_url' })
  coverImageUrl: string | null; // 第一张图片URL缓存

  @Column({ type: 'int', nullable: true, name: 'cover_image_id' })
  coverImageId: number | null; // 第一张图片ID

  // 价格信息（合并到 products 表，简化架构）
  @Column({ type: 'int', nullable: true, name: 'original_price' })
  originalPrice: number | null; // 原价（分为单位）

  @Column({ type: 'int', nullable: true, name: 'current_price' })
  currentPrice: number | null; // 现价（分为单位）

  @Column({ type: 'tinyint', default: 100, name: 'discount_rate' })
  discountRate: number; // 0-100: 78表示78折

  @Column({ type: 'char', length: 3, default: 'CNY', name: 'currency' })
  currency: string; // 货币代码

  @Column({ type: 'tinyint', nullable: true, name: 'vip_discount_rate' })
  vipDiscountRate: number | null; // VIP折扣率

  // 统计信息（合并到 products 表，简化架构）
  @Column({ type: 'int', default: 0, name: 'sales_count' })
  salesCount: number; // 销售数

  @Column({ type: 'int', default: 0, name: 'views_count' })
  viewsCount: number; // 浏览数

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0, name: 'average_rating' })
  averageRating: number; // 平均评分

  @Column({ type: 'int', default: 0, name: 'reviews_count' })
  reviewsCount: number; // 评论数

  @Column({ type: 'int', default: 0, name: 'favorites_count' })
  favoritesCount: number; // 收藏数

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'conversion_rate' })
  conversionRate: number | null; // 转化率

  @Column({ type: 'timestamp', nullable: true, name: 'last_sold_at' })
  lastSoldAt: Date | null; // 最后销售时间

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations - using lazy loading with () => Class
  @ManyToOne('Category', (category: any) => category.products, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category: any;

  @OneToMany('ProductImage', (image: any) => image.product, { eager: true })
  images: any[];

  @OneToMany('ProductAttribute', (attr: any) => attr.product)
  attributes: any[];

  @OneToOne('ProductDetails', (details: any) => details.product)
  details: any;

  @OneToMany('ProductTag', (tag: any) => tag.product)
  tags: any[];

  @OneToMany('ProductReview', (review: any) => review.product)
  reviews: any[];
}

/**
 * 商品价格实体
 */
@Entity('product_prices')
@Index(['productId'], { unique: true })
@Index(['currentPrice'])
export class ProductPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true, name: 'product_id' })
  productId: number;

  @Column({ type: 'int', name: 'original_price' })
  originalPrice: number; // 分为单位

  @Column({ type: 'int', name: 'current_price' })
  currentPrice: number; // 分为单位

  @Column({ type: 'tinyint', default: 100, name: 'discount_rate' })
  discountRate: number; // 0-100: 78表示78折

  @Column({ type: 'char', length: 3, default: 'CNY' })
  currency: string;

  @Column({ type: 'tinyint', nullable: true, name: 'vip_discount_rate' })
  vipDiscountRate: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne('Product', (product: any) => product.price, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: any;
}

/**
 * 商品图片实体
 */
@Entity('product_images')
@Index(['productId', 'imageType'])
@Index(['sortOrder'])
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'product_id' })
  productId: number;

  @Column({ type: 'varchar', length: 500, name: 'image_url' })
  imageUrl: string;

  @Column({
    type: 'enum',
    enum: ['thumb', 'cover', 'list', 'detail'],
    default: 'cover',
    name: 'image_type',
  })
  imageType: 'thumb' | 'cover' | 'list' | 'detail';

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'alt_text' })
  altText: string;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder: number;

  @Column({ type: 'int', nullable: true })
  width: number;

  @Column({ type: 'int', nullable: true })
  height: number;

  @Column({ type: 'int', nullable: true, name: 'file_size' })
  fileSize: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne('Product', (product: any) => product.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: any;
}

/**
 * 商品统计实体
 */
@Entity('product_stats')
@Index(['productId'], { unique: true })
@Index(['salesCount'])
@Index(['averageRating'])
@Index(['favoritesCount'])
export class ProductStats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true, name: 'product_id' })
  productId: number;

  @Column({ type: 'int', default: 0, name: 'sales_count' })
  salesCount: number;

  @Column({ type: 'int', default: 0, name: 'views_count' })
  viewsCount: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0, name: 'average_rating' })
  averageRating: number;

  @Column({ type: 'int', default: 0, name: 'reviews_count' })
  reviewsCount: number;

  @Column({ type: 'int', default: 0, name: 'favorites_count' })
  favoritesCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'conversion_rate' })
  conversionRate: number;

  @Column({ type: 'timestamp', nullable: true, name: 'last_sold_at' })
  lastSoldAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne('Product', (product: any) => product.stats, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: any;
}

/**
 * 商品属性实体
 */
@Entity('product_attributes')
@Index(['productId', 'attributeName'])
@Index(['productId', 'attributeName', 'attributeValue'], { unique: true })
export class ProductAttribute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'product_id' })
  productId: number;

  @Column({ type: 'varchar', length: 50, name: 'attribute_name' })
  attributeName: string; // color, size, material

  @Column({ type: 'varchar', length: 200, name: 'attribute_value' })
  attributeValue: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'attribute_sku_suffix' })
  attributeSkuSuffix: string;

  @Column({ type: 'int', default: 0, name: 'additional_price' })
  additionalPrice: number; // 分为单位

  @Column({ type: 'int', default: 0, name: 'stock_quantity' })
  stockQuantity: number;

  @Column({ type: 'varchar', length: 7, nullable: true, name: 'color_hex' })
  colorHex: string; // #000000

  @Column({ type: 'int', nullable: true, name: 'size_sort_order' })
  sizeSortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne('Product', (product: any) => product.attributes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: any;
}

/**
 * 商品详情实体
 */
@Entity('product_details')
export class ProductDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true, name: 'product_id' })
  productId: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  material: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  origin: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true, name: 'weight_value' })
  weightValue: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  length: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  width: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  height: number;

  @Column({ type: 'longtext', nullable: true, name: 'full_description' })
  fullDescription: string;

  @Column({ type: 'longtext', nullable: true })
  highlights: string; // JSON array

  @Column({ type: 'text', nullable: true, name: 'care_guide' })
  careGuide: string;

  @Column({ type: 'text', nullable: true })
  warranty: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'seo_keywords' })
  seoKeywords: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'seo_description' })
  seoDescription: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne('Product', (product: any) => product.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: any;
}

/**
 * 商品标签实体
 */
@Entity('product_tags')
@Index(['productId', 'tagName'], { unique: true })
@Index(['tagName'])
export class ProductTag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'product_id' })
  productId: number;

  @Column({ type: 'varchar', length: 50, name: 'tag_name' })
  tagName: string; // new, hot, limited, discount

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne('Product', (product: any) => product.tags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: any;
}

/**
 * 商品评价实体
 */
@Entity('product_reviews')
@Index(['productId', 'rating'])
@Index(['userId'])
@Index(['isApproved', 'createdAt'])
export class ProductReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'product_id' })
  productId: number;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @Column({ type: 'int', nullable: true, name: 'order_item_id' })
  orderItemId: number;

  @Column({ type: 'tinyint' })
  rating: number; // 1-5

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'longtext', nullable: true, name: 'review_images' })
  reviewImages: string; // JSON array

  @Column({ type: 'int', default: 0, name: 'helpful_count' })
  helpfulCount: number;

  @Column({ type: 'int', default: 0, name: 'unhelpful_count' })
  unhelpfulCount: number;

  @Column({ type: 'tinyint', default: 1, name: 'is_verified_purchase' })
  isVerifiedPurchase: boolean;

  @Column({ type: 'tinyint', default: 1, name: 'is_approved' })
  isApproved: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne('Product', (product: any) => product.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: any;
}

/**
 * 购物车商品实体
 */
@Entity('cart_items')
@Index(['userId'])
@Index(['updatedAt'])
@Unique(['userId', 'productId'])
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @Column({ type: 'int', name: 'product_id' })
  productId: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'json', nullable: true, name: 'selected_attributes' })
  selectedAttributes: Record<string, string>;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'selected_color_id' })
  selectedColorId: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'selected_size_id' })
  selectedSizeId: string;

  @Column({ type: 'int', nullable: true, name: 'cart_price' })
  cartPrice: number; // 分为单位

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne('Product', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: any;
}

/**
 * 订单实体
 */
@Entity('orders')
@Index(['userId', 'createdAt'])
@Index(['status'])
@Index(['orderNo'], { unique: true })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true, name: 'order_no' })
  orderNo: string;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @Column({ type: 'int' })
  subtotal: number; // 分为单位

  @Column({ type: 'int', default: 0, name: 'shipping_cost' })
  shippingCost: number;

  @Column({ type: 'int', default: 0, name: 'discount_amount' })
  discountAmount: number;

  @Column({ type: 'int', name: 'total_amount' })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: [
      'pending',
      'paid',
      'processing',
      'shipped',
      'delivered',
      'completed',
      'cancelled',
      'refunded',
    ],
    default: 'pending',
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid',
    name: 'payment_status',
  })
  paymentStatus: string;

  @Column({ type: 'json', nullable: true, name: 'shipping_address' })
  shippingAddress: Record<string, any>;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'receiver_name' })
  receiverName: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'receiver_phone' })
  receiverPhone: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp', nullable: true, name: 'paid_at' })
  paidAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'shipped_at' })
  shippedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'delivered_at' })
  deliveredAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany('OrderItem', (item: any) => item.order)
  items: any[];
}

/**
 * 订单商品实体
 */
@Entity('order_items')
@Index(['orderId'])
@Index(['status'])
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'order_id' })
  orderId: number;

  @Column({ type: 'int', name: 'product_id' })
  productId: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'json', nullable: true, name: 'selected_attributes' })
  selectedAttributes: Record<string, string>;

  @Column({ type: 'varchar', length: 200, name: 'product_name' })
  productName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sku: string;

  @Column({ type: 'int', name: 'price_snapshot' })
  priceSnapshot: number; // 分为单位

  @Column({ type: 'int' })
  subtotal: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'shipped', 'delivered', 'returned', 'refunded'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'tinyint', default: 1 })
  refundable: boolean;

  @Column({ type: 'text', nullable: true, name: 'refund_reason' })
  refundReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne('Order', (order: any) => order.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: any;

  @OneToMany('OrderRefund', (refund: any) => refund.orderItem)
  refunds: any[];
}

/**
 * 退款实体
 */
@Entity('order_refunds')
@Index(['status'])
@Index(['orderItemId'])
@Index(['refundNo'], { unique: true })
export class OrderRefund {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true, name: 'refund_no' })
  refundNo: string;

  @Column({ type: 'int', name: 'order_item_id' })
  orderItemId: number;

  @Column({ type: 'int', name: 'refund_amount' })
  refundAmount: number; // 分为单位

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'processing', 'completed', 'rejected'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'refund_reason' })
  refundReason: string;

  @Column({ type: 'text', nullable: true, name: 'refund_description' })
  refundDescription: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'return_tracking_no' })
  returnTrackingNo: string;

  @Column({ type: 'timestamp', nullable: true, name: 'return_received_at' })
  returnReceivedAt: Date;

  @Column({ type: 'int', nullable: true, name: 'processed_by' })
  processedBy: number;

  @Column({ type: 'text', nullable: true, name: 'processed_notes' })
  processedNotes: string;

  @Column({ type: 'timestamp', nullable: true, name: 'processed_at' })
  processedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne('OrderItem', (item: any) => item.refunds, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: any;
}
