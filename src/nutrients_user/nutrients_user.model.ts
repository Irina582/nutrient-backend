import { Column, Model, Table, HasMany } from 'sequelize-typescript';
import { Nutrients } from '../nutrients/nutrients.model';

@Table({ tableName: 'users', timestamps: false })
export class NutrientsUser extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ unique: true, allowNull: false })
  declare username: string;

  @Column({ allowNull: false })
  declare password: string;

  // ─── РОЛИ НА РУССКОМ, как в БД ───
  @Column({ defaultValue: 'создатель' })
  declare role: 'создатель' | 'модератор';

  @HasMany(() => Nutrients)
  declare nutrients: Nutrients[];
}