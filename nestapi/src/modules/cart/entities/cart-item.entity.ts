import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * CartItem Entity
 * Represents an item in the user's shopping cart
 */
@Entity('cart_items')
@Index(['userId'])
@Index(['userId', 'productId'], { unique: true })
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @Column('int', { name: 'product_id' })
  productId: number;

  @Column('int', { default: 1 })
  quantity: number;

  @Column('json', { nullable: true, name: 'selected_attributes' })
  selectedAttributes: Record<string, any>;

  /**
   * Price snapshot in cents
   * Stores the product price at the time of adding to cart
   */
  @Column('int', { nullable: true, name: 'price_snapshot' })
  priceSnapshot: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
