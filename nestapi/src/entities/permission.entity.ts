/**
 * 权限实体 - 系统权限定义
 * 用于细粒度的权限控制
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  Index,
} from 'typeorm';

@Entity('permissions')
@Index(['code'], { unique: true })
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 权限编码：如 product.create, product.edit, product.delete, product.view
   * 格式：模块.操作
   */
  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  /**
   * 权限名称（用户可读）
   */
  @Column({ type: 'varchar', length: 100 })
  name: string;

  /**
   * 权限描述
   */
  @Column({ type: 'varchar', length: 200, nullable: true })
  description: string | null;

  /**
   * 权限分组：如 product, order, user, analytics, system等
   */
  @Column({ type: 'varchar', length: 50 })
  group: string;

  /**
   * 操作类型：create, read, update, delete, export, import等
   */
  @Column({ type: 'varchar', length: 50 })
  action: string;

  /**
   * 是否为系统预设权限（不可删除）
   */
  @Column({ type: 'tinyint', default: 0 })
  isSystem: boolean;

  /**
   * 权限状态：active, inactive
   */
  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: 'active' | 'inactive';

  /**
   * 拥有该权限的角色（多对多关系）
   */
  @ManyToMany('Role', (role: any) => role.permissions)
  roles: any[];

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
