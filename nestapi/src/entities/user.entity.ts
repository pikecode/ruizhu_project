/**
 * 用户实体
 * 支持多种认证方式：手机号、微信openId、用户名密码
 * 主要登录方式：手机号 + 微信小程序授权
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity('users')
@Index(['phone'], { unique: true, where: 'phone IS NOT NULL' })
@Index(['openId'], { unique: true, where: 'open_id IS NOT NULL' })
@Index(['username'], { unique: true, where: 'username IS NOT NULL' })
@Index(['email'], { unique: true, where: 'email IS NOT NULL' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 手机号 - 微信手机号授权解密后的手机号
   * 主要登录方式，与openId绑定
   * 全局唯一
   */
  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  phone: string | null;

  /**
   * 微信openId - 小程序用户唯一标识
   * 用于识别小程序用户
   * 可与手机号绑定
   */
  @Column({ type: 'varchar', length: 100, nullable: true, unique: true, name: 'open_id' })
  openId: string | null;

  /**
   * 用户名 - 传统用户名密码登录
   * 可选，主要用于后期扩展或管理员账户
   */
  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  username: string | null;

  /**
   * 邮箱 - 用户邮箱
   * 可选
   */
  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  email: string | null;

  /**
   * 密码哈希 - 仅用于用户名密码登录
   * 手机号登录时为null
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string | null;

  /**
   * 昵称
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  nickname: string | null;

  /**
   * 头像URL - 微信头像或上传的头像
   */
  @Column({ type: 'varchar', length: 500, nullable: true, name: 'avatar_url' })
  avatarUrl: string | null;

  /**
   * 用户性别：male, female, unknown
   * 来自微信授权信息
   */
  @Column({
    type: 'enum',
    enum: ['male', 'female', 'unknown'],
    default: 'unknown',
  })
  gender: 'male' | 'female' | 'unknown';

  /**
   * 地区信息 - 微信授权的地区
   */
  @Column({ type: 'varchar', length: 200, nullable: true })
  province: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  country: string | null;

  /**
   * 是否已授权手机号
   * true: 通过微信手机号授权解密成功
   * false: 未授权或仅有openId
   */
  @Column({ type: 'tinyint', default: 0, name: 'is_phone_authorized' })
  isPhoneAuthorized: boolean;

  /**
   * 是否已授权昵称和头像信息
   * 来自getUserInfo授权
   */
  @Column({ type: 'tinyint', default: 0, name: 'is_profile_authorized' })
  isProfileAuthorized: boolean;

  /**
   * 账户状态：active, banned, deleted
   * active: 正常使用
   * banned: 被禁用
   * deleted: 软删除
   */
  @Column({
    type: 'enum',
    enum: ['active', 'banned', 'deleted'],
    default: 'active',
  })
  status: 'active' | 'banned' | 'deleted';

  /**
   * 注册来源：wechat_mini_program, web, admin
   */
  @Column({
    type: 'enum',
    enum: ['wechat_mini_program', 'web', 'admin'],
    default: 'wechat_mini_program',
    name: 'registration_source',
  })
  registrationSource: 'wechat_mini_program' | 'web' | 'admin';

  /**
   * 最后登录时间
   */
  @Column({ type: 'timestamp', nullable: true, name: 'last_login_at' })
  lastLoginAt: Date | null;

  /**
   * 最后登录IP
   */
  @Column({ type: 'varchar', length: 50, nullable: true, name: 'last_login_ip' })
  lastLoginIp: string | null;

  /**
   * 总登录次数
   */
  @Column({ type: 'int', default: 0, name: 'login_count' })
  loginCount: number;

  /**
   * 创建时间
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * 更新时间
   */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
