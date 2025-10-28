/**
 * 数组集合项目-商品关联实体
 * 管理卡片项目和商品的关联关系
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
import { ArrayCollectionItem } from './array-collection-item.entity';

@Entity('array_collection_item_products')
@Unique(['arrayCollectionItemId', 'productId'])
@Index(['arrayCollectionItemId', 'sortOrder'])
@Index(['productId'])
export class ArrayCollectionItemProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'array_collection_item_id' })
  arrayCollectionItemId: number;

  @Column({ type: 'int', name: 'product_id' })
  productId: number;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder: number; // 商品在卡片中的显示顺序

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // 关系：多个商品属于一个卡片项目
  @ManyToOne(() => ArrayCollectionItem, (item) => item.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'array_collection_item_id' })
  item: ArrayCollectionItem;
}
