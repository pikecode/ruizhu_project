import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('banners')
@Index('idx_sort_order', ['sortOrder'])
@Index('idx_is_active', ['isActive'])
@Index('idx_type', ['type'])
@Index('idx_page_type', ['pageType'])
@Index('idx_page_type_sort', ['pageType', 'sortOrder'])
@Index('idx_created_at', ['createdAt'])
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'main_title',
    comment: '大标题',
  })
  mainTitle: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '小标题',
  })
  subtitle: string | null;

  @Column({
    type: 'text',
    nullable: true,
    comment: '描述',
  })
  description: string | null;

  // 媒体字段
  @Column({
    type: 'enum',
    enum: ['image', 'video'],
    default: 'image',
    comment: '类型：image或video',
  })
  type: 'image' | 'video';

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

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'video_url',
    comment: '视频URL (COS) - webp格式',
  })
  videoUrl: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'video_key',
    comment: '视频文件Key (COS)',
  })
  videoKey: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'video_thumbnail_url',
    comment: '视频封面图URL',
  })
  videoThumbnailUrl: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'video_thumbnail_key',
    comment: '视频封面文件Key',
  })
  videoThumbnailKey: string | null;

  // 页面类型
  @Column({
    type: 'enum',
    enum: ['home', 'custom', 'profile', 'about', 'featured'],
    default: 'home',
    name: 'page_type',
    comment: '页面类型：home(首页) custom(私人定制) profile(个人页面) about(关于页面) featured(精选系列)',
  })
  pageType: 'home' | 'custom' | 'profile' | 'about' | 'featured';

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
    comment: '排序顺序',
  })
  sortOrder: number;

  // 跳转字段（可选）
  @Column({
    type: 'enum',
    enum: ['none', 'product', 'category', 'collection', 'url'],
    default: 'none',
    name: 'link_type',
    comment: '链接类型',
  })
  linkType: 'none' | 'product' | 'category' | 'collection' | 'url';

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'link_value',
    comment: '链接值（产品ID、分类ID、URL等）',
  })
  linkValue: string | null;

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
