/**
 * 数组型集合实体
 * 用于小程序首页展示的卡片集合，每个卡片包含一个标题、描述、封面图片和相关商品
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { ArrayCollectionItem } from './array-collection-item.entity';

@Entity('array_collections')
@Index(['isActive', 'sortOrder'])
@Index(['createdAt'])
export class ArrayCollection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  title: string; // 数组集合的标题，如"品牌故事"

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  slug: string; // 数组集合的slug，用于URL和查询，如"brand-story"

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string; // 数组集合的描述

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder: number; // 显示顺序

  @Column({ type: 'tinyint', default: 1, name: 'is_active' })
  isActive: boolean; // 是否激活

  @Column({ type: 'text', nullable: true })
  remark: string; // 备注说明

  // 关系：一个数组集合可以有多个卡片项目
  @OneToMany(() => ArrayCollectionItem, (item) => item.arrayCollection, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  items: ArrayCollectionItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
