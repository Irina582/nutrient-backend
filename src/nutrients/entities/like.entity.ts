import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import type { User } from './user.entity';
import type { Nutrient } from './nutrient.entity';

@Entity('likes')
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'int' })
  nutrientId: number;

  @ManyToOne('User', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne('Nutrient', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'nutrientId' })
  nutrient: Nutrient;
}