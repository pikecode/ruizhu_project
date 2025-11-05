import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('member_benefits')
@Index('idx_sort_order', ['sortOrder'])
@Index('idx_is_active', ['isActive'])
export class MemberBenefit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '礼遇标题',
  })
  title: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '礼遇副标题/描述',
  })
  subtitle: string | null;

  // 图片字段
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'image_url',
    comment: '图片URL (COS)',
  })
  imageUrl: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'image_key',
    comment: '图片文件Key (COS)',
  })
  imageKey: string | null;

  // 状态字段
  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
    comment: '是否启用',
  })
  isActive: boolean;

  @Column({
    type: 'int',
    default: 0,
    name: 'sort_order',
    comment: '排序顺序（从小到大）',
  })
  sortOrder: number;

  // 时间戳
  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
