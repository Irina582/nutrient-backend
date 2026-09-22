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

  // FK на users.id — каскадное удаление запрещено
  @ManyToOne('User', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // FK на nutrients.id — каскадное удаление запрещено
  @ManyToOne('Nutrient', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'nutrientId' })
  nutrient: Nutrient;
}