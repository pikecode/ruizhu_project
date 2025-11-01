import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * User Authorization Entity
 * Stores user's personal information authorization preferences
 */
@Entity('user_authorizations')
@Index(['userId'])
export class UserAuthorization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { name: 'user_id', unique: true })
  userId: number;

  @Column('tinyint', { default: 1, name: 'registration' })
  registration: number; // 注册于RUIZHU集团顾客数据库 (必需，默认同意)

  @Column('tinyint', { default: 1, name: 'analysis' })
  analysis: number; // 数据分析授权 (可选)

  @Column('tinyint', { default: 1, name: 'marketing' })
  marketing: number; // 营销授权 (可选)

  @Column('tinyint', { default: 1, name: 'transfer' })
  transfer: number; // 个人信息跨境转移 (可选)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
