/**
 * 集合（模块）实体
 * 用于管理小程序首页模块，如"精品服饰"、"精品珠宝"等
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
  OneToMany,
} from 'typeorm';
import { CollectionProduct } from './collection-product.entity';

@Entity('collections')
@Unique(['slug'])
@Index(['isActive', 'sortOrder'])
@Index(['isFeatured'])
@Index(['createdAt'])
export class Collection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string; // 集合名称，如"精品服饰"

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  slug: string; // URL友好的标识，如"premium-clothing"

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string; // 集合描述

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'cover_image_url' })
  coverImageUrl: string | null; // 集合封面图片

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'icon_url' })
  iconUrl: string | null; // 集合图标

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder: number; // 显示顺序

  @Column({ type: 'tinyint', default: 1, name: 'is_active' })
  isActive: boolean; // 是否激活

  @Column({ type: 'tinyint', default: 0, name: 'is_featured' })
  isFeatured: boolean; // 是否在首页展示

  @Column({ type: 'text', nullable: true })
  remark: string; // 备注说明

  // 关系
  @OneToMany(() => CollectionProduct, (cp) => cp.collection, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  collectionProducts: CollectionProduct[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
