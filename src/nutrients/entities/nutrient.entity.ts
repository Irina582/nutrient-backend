import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import type { User } from './user.entity';

export type NutrientStatus = 'черновик' | 'опубликован' | 'удален';

@Entity('nutrients')
export class Nutrient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'float', nullable: true })
  dailyNorm: number | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  unit: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 20, default: 'черновик' })
  status: NutrientStatus;

  @Column({ type: 'varchar', length: 255 })
  imageKey: string;

  @Column({ type: 'varchar', length: 255 })
  videoKey: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  formedAt: Date | null;

  @Column({ type: 'int' })
  creatorId: number;

  @ManyToOne('User', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'creatorId' })
  creator: User;
}