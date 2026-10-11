import { Column, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { NutrientsUser } from '../nutrients_user/nutrients_user.model';
import { Nutrients } from './nutrients.model';

@Table({ tableName: 'likes', timestamps: false })
export class NutrientsLike extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @ForeignKey(() => NutrientsUser)
  @Column({ type: 'integer' })
  declare userId: number;

  @ForeignKey(() => Nutrients)
  @Column({ type: 'integer' })
  declare nutrientId: number;

  @BelongsTo(() => NutrientsUser)
  declare user: NutrientsUser;

  @BelongsTo(() => Nutrients)
  declare nutrient: Nutrients;
}