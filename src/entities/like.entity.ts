import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Nutrient } from './nutrient.entity';

@Entity('likes')
export class Like {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @PrimaryColumn({ name: 'nutrient_id' })
  nutrientId: number;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'NOW()' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.likes)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Nutrient, (nutrient) => nutrient.likes)
  @JoinColumn({ name: 'nutrient_id' })
  nutrient: Nutrient;
}