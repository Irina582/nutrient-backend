import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import type { NutrientsUser } from '../nutrients_user/nutrients_user.entity';

export type NutrientStatus = 'черновик' | 'опубликован' | 'удален';

@Entity('nutrients')
export class Nutrients {
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

  @Column({ type: 'varchar', length: 255, default: '' })
  imageKey: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  videoKey: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  formedAt: Date | null;

  @Column({ type: 'int' })
  creatorId: number;

  @ManyToOne('NutrientsUser', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'creatorId' })
  creator: NutrientsUser;
}