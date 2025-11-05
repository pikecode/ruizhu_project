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

  @Column('int', { name: 'user_id' })
  userId: number;

  @Column('varchar', { length: 100, name: 'receiver_name' })
  receiverName: string;

  @Column('varchar', { length: 20, name: 'receiver_phone' })
  receiverPhone: string;

  @Column('varchar', { length: 100 })
  province: string;

  @Column('varchar', { length: 100 })
  city: string;

  @Column('varchar', { length: 100, nullable: true })
  district: string;

  @Column('text', { name: 'address_detail' })
  addressDetail: string;

  @Column('varchar', { length: 20, nullable: true, name: 'postal_code' })
  postalCode: string;

  @Column('tinyint', { default: 0, name: 'is_default' })
  isDefault: number;

  @Column('varchar', { length: 50, nullable: true })
  label: string;

  @Column('tinyint', { default: 0, name: 'is_deleted' })
  isDeleted: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
