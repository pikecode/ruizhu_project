/**
 * 集合-产品关联实体
 * 管理集合和产品的多对多关系
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
  Unique,
  JoinColumn,
} from 'typeorm';
import { Collection } from './collection.entity';

@Entity('collection_products')
@Unique(['collectionId', 'productId'])
@Index(['collectionId', 'sortOrder'])
@Index(['productId'])
export class CollectionProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'collection_id' })
  collectionId: number;

  @Column({ type: 'int', name: 'product_id' })
  productId: number;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder: number; // 该集合内的显示顺序

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // 关系
  @ManyToOne(() => Collection, (collection) => collection.collectionProducts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'collection_id' })
  collection: Collection;
}
