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
@Index(['isSaleOn', 'isOutOfStock'])
@Index(['createdAt'])
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  name: string; // 大标题

  @Column({ type: 'varchar', length: 200, nullable: true })
  subtitle: string; // 小标题

  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  categoryId: number;

  @Column({ type: 'tinyint', default: 0 })
  isNew: boolean;

  @Column({ type: 'tinyint', default: 1 })
  isSaleOn: boolean;

  @Column({ type: 'tinyint', default: 0 })
  isOutOfStock: boolean;

  @Column({ type: 'tinyint', default: 0 })
  isSoldOut: boolean;

  @Column({ type: 'tinyint', default: 0 })
  isVipOnly: boolean;

  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ type: 'int', default: 10 })
  lowStockThreshold: number;

  @Column({ type: 'int', nullable: true })
  weight: number; // 克

  @Column({ type: 'int', nullable: true })
  shippingTemplateId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  freeShippingThreshold: number; // 元

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations - using lazy loading with () => Class
  @ManyToOne('Category', (category: any) => category.products, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category: any;

  @OneToOne('ProductPrice', (price: any) => price.product, { eager: true })
  price: any;

  @OneToMany('ProductImage', (image: any) => image.product, { eager: true })
  images: any[];

  @OneToOne('ProductStats', (stats: any) => stats.product, { eager: true })
  stats: any;

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

  @Column({ type: 'int', unique: true })
  productId: number;

  @Column({ type: 'int' })
  originalPrice: number; // 分为单位

  @Column({ type: 'int' })
  currentPrice: number; // 分为单位

  @Column({ type: 'tinyint', default: 100 })
  discountRate: number; // 0-100: 78表示78折

  @Column({ type: 'char', length: 3, default: 'CNY' })
  currency: string;

  @Column({ type: 'tinyint', nullable: true })
  vipDiscountRate: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
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

  @Column({ type: 'int' })
  productId: number;

  @Column({ type: 'varchar', length: 500 })
  imageUrl: string;

  @Column({
    type: 'enum',
    enum: ['thumb', 'cover', 'list', 'detail'],
    default: 'cover',
  })
  imageType: 'thumb' | 'cover' | 'list' | 'detail';

  @Column({ type: 'varchar', length: 200, nullable: true })
  altText: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'int', nullable: true })
  width: number;

  @Column({ type: 'int', nullable: true })
  height: number;

  @Column({ type: 'int', nullable: true })
  fileSize: number;

  @CreateDateColumn()
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

  @Column({ type: 'int', unique: true })
  productId: number;

  @Column({ type: 'int', default: 0 })
  salesCount: number;

  @Column({ type: 'int', default: 0 })
  viewsCount: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ type: 'int', default: 0 })
  reviewsCount: number;

  @Column({ type: 'int', default: 0 })
  favoritesCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  conversionRate: number;

  @Column({ type: 'timestamp', nullable: true })
  lastSoldAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
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

  @Column({ type: 'int' })
  productId: number;

  @Column({ type: 'varchar', length: 50 })
  attributeName: string; // color, size, material

  @Column({ type: 'varchar', length: 200 })
  attributeValue: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  attributeSkuSuffix: string;

  @Column({ type: 'int', default: 0 })
  additionalPrice: number; // 分为单位

  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ type: 'varchar', length: 7, nullable: true })
  colorHex: string; // #000000

  @Column({ type: 'int', nullable: true })
  sizeSortOrder: number;

  @CreateDateColumn()
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

  @Column({ type: 'int', unique: true })
  productId: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  material: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  origin: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  weightValue: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  length: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  width: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  height: number;

  @Column({ type: 'longtext', nullable: true })
  fullDescription: string;

  @Column({ type: 'longtext', nullable: true })
  highlights: string; // JSON array

  @Column({ type: 'text', nullable: true })
  careGuide: string;

  @Column({ type: 'text', nullable: true })
  warranty: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  seoKeywords: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  seoDescription: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
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

  @Column({ type: 'int' })
  productId: number;

  @Column({ type: 'varchar', length: 50 })
  tagName: string; // new, hot, limited, discount

  @CreateDateColumn()
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

  @Column({ type: 'int' })
  productId: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'int', nullable: true })
  orderItemId: number;

  @Column({ type: 'tinyint' })
  rating: number; // 1-5

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'longtext', nullable: true })
  reviewImages: string; // JSON array

  @Column({ type: 'int', default: 0 })
  helpfulCount: number;

  @Column({ type: 'int', default: 0 })
  unhelpfulCount: number;

  @Column({ type: 'tinyint', default: 1 })
  isVerifiedPurchase: boolean;

  @Column({ type: 'tinyint', default: 1 })
  isApproved: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
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

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'int' })
  productId: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'json', nullable: true })
  selectedAttributes: Record<string, string>;

  @Column({ type: 'varchar', length: 100, nullable: true })
  selectedColorId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  selectedSizeId: string;

  @Column({ type: 'int', nullable: true })
  cartPrice: number; // 分为单位

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
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

  @Column({ type: 'varchar', length: 100, unique: true })
  orderNo: string;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'int' })
  subtotal: number; // 分为单位

  @Column({ type: 'int', default: 0 })
  shippingCost: number;

  @Column({ type: 'int', default: 0 })
  discountAmount: number;

  @Column({ type: 'int' })
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
  })
  paymentStatus: string;

  @Column({ type: 'json', nullable: true })
  shippingAddress: Record<string, any>;

  @Column({ type: 'varchar', length: 100, nullable: true })
  receiverName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  receiverPhone: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  shippedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
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

  @Column({ type: 'int' })
  orderId: number;

  @Column({ type: 'int' })
  productId: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'json', nullable: true })
  selectedAttributes: Record<string, string>;

  @Column({ type: 'varchar', length: 200 })
  productName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sku: string;

  @Column({ type: 'int' })
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

  @Column({ type: 'text', nullable: true })
  refundReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
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

  @Column({ type: 'varchar', length: 100, unique: true })
  refundNo: string;

  @Column({ type: 'int' })
  orderItemId: number;

  @Column({ type: 'int' })
  refundAmount: number; // 分为单位

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'processing', 'completed', 'rejected'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  refundReason: string;

  @Column({ type: 'text', nullable: true })
  refundDescription: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  returnTrackingNo: string;

  @Column({ type: 'timestamp', nullable: true })
  returnReceivedAt: Date;

  @Column({ type: 'int', nullable: true })
  processedBy: number;

  @Column({ type: 'text', nullable: true })
  processedNotes: string;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne('OrderItem', (item: any) => item.refunds, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: any;
}
