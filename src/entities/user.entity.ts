import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Nutrient } from './nutrient.entity';
import { Like } from './like.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64, unique: true })
  login: string;

  @Column({ length: 128 })
  password: string;

  @Column({ name: 'is_admin', default: false })
  isAdmin: boolean;

  @Column({ name: 'is_manager', default: false })
  isManager: boolean;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'NOW()' })
  createdAt: Date;

  @OneToMany(() => Nutrient, (nutrient) => nutrient.creator)
  nutrients: Nutrient[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];
}