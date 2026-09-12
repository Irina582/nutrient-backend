import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Nutrient } from '../entities/nutrient.entity';
import { Like } from '../entities/like.entity';
import { User } from '../entities/user.entity';
import { CreateNutrientDto } from './dto/create-nutrient.dto';
import { PublishNutrientDto } from './dto/publish-nutrient.dto';

@Injectable()
export class NutrientsService {
  constructor(
    @InjectRepository(Nutrient)
    private readonly nutrientRepo: Repository<Nutrient>,
    @InjectRepository(Like)
    private readonly likeRepo: Repository<Like>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async findAllVisible(minNorm?: number): Promise<any[]> {
    const qb = this.nutrientRepo
      .createQueryBuilder('n')
      .leftJoin('n.likes', 'l')
      .addSelect('COUNT(l.userId)', 'likesCount')
      .where('n.status = :status', { status: 'опубликован' })
      .groupBy('n.id')
      .orderBy('n.id', 'ASC');

    if (minNorm) {
      qb.andWhere('n.dailyNorm >= :minNorm', { minNorm });
    }

    const raw = await qb.getRawAndEntities();
    return raw.entities.map((n, i) => ({
      ...n,
      likesCount: parseInt(raw.raw[i]?.likesCount || '0', 10),
    }));
  }

  async findById(id: number): Promise<Nutrient | null> {
    return this.nutrientRepo.findOne({
      where: { id, status: 'опубликован' },
      relations: { likes: true },
    });
  }

  async findFeedItem(id?: number, next?: boolean): Promise<Nutrient | null> {
    const list = await this.nutrientRepo.find({
      where: { status: 'опубликован' },
      order: { id: 'ASC' },
    });

    if (list.length === 0) return null;
    if (!id) return list[0];

    if (next) {
      const idx = list.findIndex((n) => n.id === id);
      if (idx === -1) return list[0];
      return list[idx + 1] ?? list[0];
    }

    return list.find((n) => n.id === id) ?? null;
  }

  async findDraft(): Promise<Nutrient | null> {
    return this.nutrientRepo.findOne({
      where: { status: 'черновик' },
    });
  }

  async countLikes(nutrientId: number): Promise<number> {
    return this.likeRepo.count({ where: { nutrientId } });
  }

  async create(dto: CreateNutrientDto, creatorId: number): Promise<Nutrient> {
    const nutrient = this.nutrientRepo.create({
      ...dto,
      status: 'черновик',
      creatorId,
    });
    return this.nutrientRepo.save(nutrient);
  }

  async publish(id: number, dto: PublishNutrientDto): Promise<Nutrient | null> {
    const nutrient = await this.nutrientRepo.findOne({ where: { id } });
    if (!nutrient) return null;

    nutrient.name = dto.name;
    nutrient.shortDescription = dto.shortDescription;
    nutrient.dailyNorm = dto.dailyNorm;
    nutrient.unit = dto.unit;
    nutrient.category = dto.category;
    nutrient.status = 'опубликован';

    return this.nutrientRepo.save(nutrient);
  }

  async softDelete(id: number): Promise<boolean> {
    const result = await this.dataSource.query(
      `UPDATE nutrients SET status = 'удален' WHERE id = $1`,
      [id],
    );
    return result[1] > 0;
  }

  async deleteWithCursor(id: number): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(
        `DECLARE nutrient_cursor CURSOR FOR
         SELECT id FROM nutrients WHERE id = $1 AND status = 'опубликован'`,
        [id],
      );

      const rows = await queryRunner.query(`FETCH NEXT FROM nutrient_cursor`);

      if (rows.length === 0) {
        await queryRunner.query(`CLOSE nutrient_cursor`);
        await queryRunner.rollbackTransaction();
        return false;
      }

      await queryRunner.query(
        `UPDATE nutrients SET status = 'удален' WHERE CURRENT OF nutrient_cursor`,
      );

      await queryRunner.query(`CLOSE nutrient_cursor`);
      await queryRunner.commitTransaction();
      return true;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}