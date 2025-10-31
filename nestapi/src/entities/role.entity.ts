/**
 * 角色实体 - 管理员角色定义
 * 支持多个权限
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 角色名称：admin, moderator, editor, viewer等
   * admin: 系统管理员（完全权限）
   * moderator: 版主（部分权限）
   * editor: 编辑者（内容编辑权限）
   * viewer: 查看者（只读权限）
   */
  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  /**
   * 角色描述
   */
  @Column({ type: 'varchar', length: 200, nullable: true })
  description: string | null;

  /**
   * 是否为系统预设角色（不可删除）
   */
  @Column({ type: 'tinyint', default: 0 })
  isSystem: boolean;

  /**
   * 角色状态：active, inactive
   */
  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: 'active' | 'inactive';

  /**
   * 角色所拥有的权限（多对多关系）
   */
  @ManyToMany('Permission', (permission: any) => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: any[];

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
