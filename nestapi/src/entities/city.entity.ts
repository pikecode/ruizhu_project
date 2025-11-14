import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Province } from './province.entity';
import { District } from './district.entity';

/**
 * 城市实体
 */
@Entity('cities')
@Index(['provinceId', 'code'], { unique: true })
@Index(['provinceId', 'name'])
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'province_id' })
  provinceId: number;

  @Column({ type: 'varchar', length: 50 })
  code: string; // 城市代码，如 'BJ01'

  @Column({ type: 'varchar', length: 100 })
  name: string; // 城市名称，如 '北京市'、'朝阳区'

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder: number;

  @ManyToOne(() => Province, (province) => province.cities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'province_id' })
  province: Province;

  @OneToMany(() => District, (district) => district.city, { cascade: true })
  districts: District[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
