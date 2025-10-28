/**
 * 数组集合项目实体
 * 代表数组集合中的一个卡片，包含标题、描述、封面图片
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ArrayCollection } from './array-collection.entity';
import { ArrayCollectionItemProduct } from './array-collection-item-product.entity';

@Entity('array_collection_items')
@Index(['arrayCollectionId', 'sortOrder'])
@Index(['arrayCollectionId'])
export class ArrayCollectionItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'array_collection_id' })
  arrayCollectionId: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  title: string; // 卡片标题，如"新品上市"

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string; // 卡片描述

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'cover_image_url' })
  coverImageUrl: string | null; // 卡片封面图片URL

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder: number; // 卡片在集合中的显示顺序

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关系：多个卡片项目属于一个数组集合
  @ManyToOne(() => ArrayCollection, (collection) => collection.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'array_collection_id' })
  arrayCollection: ArrayCollection;

  // 关系：一个卡片项目可以包含多个商品
  @OneToMany(() => ArrayCollectionItemProduct, (product) => product.item, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  products: ArrayCollectionItemProduct[];
}
