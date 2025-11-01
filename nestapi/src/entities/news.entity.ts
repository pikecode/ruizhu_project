import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('news')
@Index('idx_is_active', ['isActive'])
@Index('idx_sort_order', ['sortOrder'])
@Index('idx_created_at', ['createdAt'])
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '标题',
  })
  title: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '副标题',
  })
  subtitle: string | null;

  @Column({
    type: 'text',
    nullable: true,
    comment: '描述',
  })
  description: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'cover_image_key',
    comment: '封面图文件Key (COS)',
  })
  coverImageKey: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'detail_image_key',
    comment: '详情图文件Key (COS)',
  })
  detailImageKey: string | null;

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
    comment: '排序顺序',
  })
  sortOrder: number;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
