import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { City } from './city.entity';

/**
 * 省份实体
 */
@Entity('provinces')
@Index(['code'], { unique: true })
@Index(['name'])
export class Province {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string; // 省份代码，如 'BJ' 表示北京

  @Column({ type: 'varchar', length: 100 })
  name: string; // 省份名称，如 '北京市'

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder: number;

  @OneToMany(() => City, (city) => city.province, { cascade: true })
  cities: City[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
