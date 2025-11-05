import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nickname: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'avatar_url' })
  avatarUrl: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'manager', 'operator'],
    default: 'operator',
  })
  role: 'admin' | 'manager' | 'operator';

  @Column({ type: 'json', nullable: true })
  permissions: Record<string, any>;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'banned'],
    default: 'active',
  })
  status: 'active' | 'inactive' | 'banned';

  @Column({ type: 'boolean', default: false, name: 'is_super_admin' })
  isSuperAdmin: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'last_login_at' })
  lastLoginAt: Date;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'last_login_ip' })
  lastLoginIp: string;

  @Column({ type: 'int', default: 0, name: 'login_count' })
  loginCount: number;

  @Column({ type: 'int', nullable: true, name: 'created_by' })
  createdBy: number;

  @Column({ type: 'int', nullable: true, name: 'updated_by' })
  updatedBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
