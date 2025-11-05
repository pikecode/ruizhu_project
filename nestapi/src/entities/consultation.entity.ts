/**
 * 产品咨询实体
 * 用于存储用户的定制产品咨询记录
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('consultations')
@Index(['productId'])
@Index(['categoryId'])
@Index(['userPhone'])
@Index(['status'])
@Index(['createdAt'])
@Index(['productId', 'categoryId'])
export class Consultation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'product_id' })
  productId: number; // 产品ID

  @Column({ type: 'varchar', length: 255, name: 'product_name' })
  productName: string; // 产品名称

  @Column({ type: 'int', name: 'category_id' })
  categoryId: number; // 类别ID

  @Column({ type: 'varchar', length: 100, name: 'category_name' })
  categoryName: string; // 类别名称

  @Column({ type: 'varchar', length: 100, name: 'user_name' })
  userName: string; // 用户姓名

  @Column({ type: 'varchar', length: 20, name: 'user_phone' })
  userPhone: string; // 用户电话

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'user_email' })
  userEmail: string | null; // 用户邮箱

  @Column({ type: 'varchar', length: 100, nullable: true })
  color: string | null; // 选择的颜色

  // 服装相关字段
  @Column({ type: 'varchar', length: 50, nullable: true })
  height: string | null; // 身高(cm)

  @Column({ type: 'varchar', length: 50, nullable: true })
  weight: string | null; // 体重(kg)

  @Column({ type: 'varchar', length: 50, nullable: true })
  chest: string | null; // 胸围(cm)

  @Column({ type: 'varchar', length: 50, nullable: true })
  waist: string | null; // 腰围(cm)

  @Column({ type: 'varchar', length: 50, nullable: true })
  hip: string | null; // 臀围(cm)

  // 鞋履相关字段
  @Column({ type: 'varchar', length: 50, nullable: true, name: 'shoe_size' })
  shoeSize: string | null; // 鞋码(欧码)

  // 珠宝相关字段
  @Column({ type: 'varchar', length: 50, nullable: true, name: 'ring_size' })
  ringSize: string | null; // 戒指码

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'jewelry_size' })
  jewelrySize: string | null; // 珠宝尺寸(mm)

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'jewelry_material' })
  jewelryMaterial: string | null; // 珠宝材质偏好

  // 香水相关字段
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'perfume_preference' })
  perfumePreference: string | null; // 香调偏好

  // 通用字段
  @Column({ type: 'longtext', nullable: true })
  remarks: string | null; // 备注/定制需求

  @Column({
    type: 'enum',
    enum: ['unread', 'read', 'processing', 'completed'],
    default: 'unread',
  })
  status: 'unread' | 'read' | 'processing' | 'completed'; // 咨询状态

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
