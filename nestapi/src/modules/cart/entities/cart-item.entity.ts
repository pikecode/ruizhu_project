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

  @Column('int')
  userId: number;

  @Column('int')
  productId: number;

  @Column('int', { default: 1 })
  quantity: number;

  @Column('json', { nullable: true })
  selectedAttributes: Record<string, any>;

  /**
   * Price snapshot in cents
   * Stores the product price at the time of adding to cart
   */
  @Column('int', { nullable: true })
  priceSnapshot: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
