import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * UserAddress Entity
 * Represents delivery addresses associated with a user
 */
@Entity('user_addresses')
@Index(['userId'])
@Index(['userId', 'isDefault'])
@Index(['userId', 'isDeleted'])
export class UserAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  userId: number;

  @Column('varchar', { length: 100 })
  receiverName: string;

  @Column('varchar', { length: 20 })
  receiverPhone: string;

  @Column('varchar', { length: 100 })
  province: string;

  @Column('varchar', { length: 100 })
  city: string;

  @Column('varchar', { length: 100, nullable: true })
  district: string;

  @Column('text')
  addressDetail: string;

  @Column('varchar', { length: 20, nullable: true })
  postalCode: string;

  @Column('tinyint', { default: 0 })
  isDefault: number;

  @Column('varchar', { length: 50, nullable: true })
  label: string;

  @Column('tinyint', { default: 0 })
  isDeleted: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
