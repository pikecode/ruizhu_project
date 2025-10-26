import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 100 })
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  realName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'int', nullable: true })
  roleId: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // WeChat fields
  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  openid: string;

  @Column({ type: 'text', nullable: true })
  sessionKey: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  wechatNickname: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  unionid: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
