import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type NutrientStatus = 'черновик' | 'опубликован' | 'удален';

@Entity('nutrients')
export class Nutrient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'float' })
  dailyNorm: number;

  @Column({ type: 'varchar', length: 20 })
  unit: string;

  // description — теперь nullable
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 20, default: 'черновик' })
  status: NutrientStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageKey: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  videoKey: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  formedAt: Date | null;

  // creatorId — теперь NOT NULL
  @Column({ type: 'int' })
  creatorId: number;
}