import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { City } from './city.entity';

/**
 * 地区实体
 */
@Entity('districts')
@Index(['cityId', 'code'], { unique: true })
@Index(['cityId', 'name'])
export class District {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'city_id' })
  cityId: number;

  @Column({ type: 'varchar', length: 50 })
  code: string; // 地区代码，如 'BJ0101'

  @Column({ type: 'varchar', length: 100 })
  name: string; // 地区名称，如 '朝阳社区'

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder: number;

  @ManyToOne(() => City, (city) => city.districts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'city_id' })
  city: City;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
