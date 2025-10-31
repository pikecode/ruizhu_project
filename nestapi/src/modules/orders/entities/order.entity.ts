import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * OrderItem Structure
 * Represents a single item in an order
 */
export interface IOrderItem {
  productId: number;
  productName?: string;
  quantity: number;
  price: number; // Price in cents at time of order
  selectedAttributes?: Record<string, any>;
}

/**
 * Order Entity
 * Represents a customer order
 */
@Entity('orders')
@Index(['userId'])
@Index(['paymentId'])
@Index(['orderNumber'])
@Index(['status'])
@Index(['userId', 'status'])
@Index(['createdAt'])
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  userId: number;

  @Column('varchar', { length: 100, unique: true })
  orderNumber: string;

  @Column('int', { nullable: true })
  paymentId: number;

  @Column('int', { nullable: true })
  addressId: number;

  /**
   * Array of order items
   * Each item contains: productId, quantity, price (in cents), selectedAttributes
   */
  @Column('json')
  items: IOrderItem[];

  /**
   * Total amount in cents (sum of item prices * quantities)
   */
  @Column('int')
  totalAmount: number;

  /**
   * Shipping cost in cents
   */
  @Column('int', { default: 0 })
  shippingAmount: number;

  /**
   * Discount amount in cents (discount codes, promotions, etc.)
   */
  @Column('int', { default: 0 })
  discountAmount: number;

  /**
   * Final amount to pay in cents
   * = totalAmount + shippingAmount - discountAmount
   */
  @Column('int')
  finalAmount: number;

  /**
   * Order status lifecycle:
   * - pending: Order created, awaiting payment
   * - paid: Payment received
   * - shipped: Order has been shipped
   * - delivered: Order delivered to customer
   * - cancelled: Order was cancelled
   * - refunded: Payment has been refunded
   */
  @Column('enum', {
    enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
  })
  status: string;

  @Column('text', { nullable: true })
  remark: string;

  @Column('varchar', { length: 100, nullable: true })
  trackingNumber: string;

  @Column('timestamp', { nullable: true })
  shippedAt: Date;

  @Column('timestamp', { nullable: true })
  deliveredAt: Date;

  @Column('timestamp', { nullable: true })
  cancelledAt: Date;

  /**
   * Refunded amount in cents
   */
  @Column('int', { default: 0 })
  refundAmount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
