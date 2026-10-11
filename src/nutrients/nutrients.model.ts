import { Column, Model, Table, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { NutrientsUser } from '../nutrients_user/nutrients_user.model';
import { NutrientsLike } from './nutrients_like.model';

@Table({ tableName: 'nutrients', timestamps: false })
export class Nutrients extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ allowNull: false })
  declare name: string;

  @Column({ allowNull: true })
  declare description: string;

  @Column({ allowNull: true })
  declare dailyNorm: number;

  @Column({ allowNull: true })
  declare unit: string;

  @Column({ defaultValue: 'черновик' })
  declare status: 'черновик' | 'опубликован' | 'удален';

  @Column({ defaultValue: '' })
  declare imageKey: string;

  @Column({ defaultValue: '' })
  declare videoKey: string;

  @Column({ type: 'timestamp', allowNull: true })
  declare formedAt: Date | null;

  @Column({ type: 'timestamp', allowNull: false, defaultValue: new Date() })
  declare createdAt: Date;

  @ForeignKey(() => NutrientsUser)
  @Column
  declare creatorId: number;

  @BelongsTo(() => NutrientsUser)
  declare creator: NutrientsUser;

  @HasMany(() => NutrientsLike)
  declare likes: NutrientsLike[];
}