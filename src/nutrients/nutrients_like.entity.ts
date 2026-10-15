import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import type { NutrientsUser } from '../nutrients_user/nutrients_user.entity';
import type { Nutrients } from './nutrients.entity';

@Entity('likes')
export class NutrientsLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'int' })
  nutrientId: number;

  @ManyToOne('NutrientsUser', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user: NutrientsUser;

  @ManyToOne('Nutrients', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'nutrientId' })
  nutrient: Nutrients;
}