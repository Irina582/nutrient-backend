import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Like } from './like.entity';

export type NutrientStatus = 'черновик' | 'опубликован' | 'удален';

@Entity('nutrients')
export class Nutrient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription: string;

  @Column({ length: 20, default: 'черновик' })
  status: NutrientStatus;

  @Column({ name: 'image_url', length: 255, nullable: true })
  imageUrl: string;

  @Column({ name: 'video_url', length: 255, nullable: true })
  videoUrl: string;

  @Column({ name: 'daily_norm', type: 'numeric', precision: 10, scale: 2, nullable: true })
  dailyNorm: number;

  @Column({ length: 20, nullable: true })
  unit: string;

  @Column({ length: 50, nullable: true })
  category: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'NOW()' })
  createdAt: Date;

  @Column({ name: 'creator_id' })
  creatorId: number;

  @ManyToOne(() => User, (user) => user.nutrients)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @OneToMany(() => Like, (like) => like.nutrient)
  likes: Like[];
}