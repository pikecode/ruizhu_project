import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * Membership Entity
 * Stores user's membership information (profile, consents, preferences)
 */
@Entity('memberships')
@Index(['userId'])
export class Membership {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { name: 'user_id', unique: true })
  userId: number;

  // 个人信息
  @Column('varchar', { length: 10, name: 'salutation' })
  salutation: string; // 先生 / 女士

  @Column('varchar', { length: 50, name: 'last_name' })
  lastName: string; // 姓

  @Column('varchar', { length: 50, name: 'first_name' })
  firstName: string; // 名

  @Column('varchar', { length: 20, name: 'mobile' })
  mobile: string; // 手机号

  @Column('date', { name: 'birth_date', nullable: true })
  birthDate: Date; // 出生日期

  @Column('varchar', { length: 50, name: 'province', nullable: true })
  province: string; // 省

  @Column('varchar', { length: 50, name: 'city', nullable: true })
  city: string; // 市

  @Column('varchar', { length: 50, name: 'district', nullable: true })
  district: string; // 区

  // 授权同意
  @Column('tinyint', { default: 1, name: 'required_consent' })
  requiredConsent: number; // 隐私政策必要同意（0=否, 1=是）

  @Column('tinyint', { default: 0, name: 'marketing_consent' })
  marketingConsent: number; // 加入集团顾客数据库（0=否, 1=是）

  // 可选授权
  @Column('tinyint', { default: 0, name: 'analysis_consent' })
  analysisConsent: number; // 数据分析（0=否, 1=是）

  @Column('tinyint', { default: 0, name: 'marketing_optional_consent' })
  marketingOptionalConsent: number; // 营销可选授权（0=否, 1=是）

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
