import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nutrient } from './entities/nutrient.entity';
import { Like as LikeEntity } from './entities/like.entity';

@Injectable()
export class NutrientsService {
  constructor(
    @InjectRepository(Nutrient)
    private nutrientRepository: Repository<Nutrient>,
    @InjectRepository(LikeEntity)
    private likeRepository: Repository<LikeEntity>,
  ) {}

  /** Плитка: список опубликованных с фильтром по норме — через ORM */
  async findAllVisible(minNorm?: number, maxNorm?: number): Promise<Nutrient[]> {
    const qb = this.nutrientRepository
      .createQueryBuilder('n')
      .where('n.status = :status', { status: 'опубликован' });

    if (minNorm !== undefined) {
      qb.andWhere('n."dailyNorm" >= :minNorm', { minNorm });
    }
    if (maxNorm !== undefined) {
      qb.andWhere('n."dailyNorm" <= :maxNorm', { maxNorm });
    }

    return qb.getMany();
  }

  /** Черновик (не более одного) — через ORM */
  async findDraft(): Promise<Nutrient | undefined> {
    const draft = await this.nutrientRepository.findOne({
      where: { status: 'черновик', creatorId: 1 },
    });
    return draft ?? undefined;
  }

  /** Лента по id / следующий — через ORM */
  async findFeedItem(id?: number, next?: boolean): Promise<Nutrient | undefined> {
    const list = await this.nutrientRepository.find({
      where: { status: 'опубликован' },
      order: { id: 'ASC' },
    });

    if (!id) return list[0];
    if (next) {
      const idx = list.findIndex((n) => n.id === id);
      if (idx === -1) return list[0];
      return list[idx + 1] ?? list[0];
    }
    return list.find((n) => n.id === id);
  }

  /** Количество лайков — через ORM */
  async countLikes(nutrient: Nutrient): Promise<number> {
    return this.likeRepository.count({ where: { nutrientId: nutrient.id } });
  }

  /** Получение одной услуги по id через КУРСОР (raw SQL) */
  async getNutrientById(id: number): Promise<Nutrient | null> {
    const rows = await this.nutrientRepository.query(
      `SELECT * FROM nutrients WHERE id = $1 AND status <> 'удален'`,
      [id],
    );
    return rows[0] ?? null;
  }

  /** Мягкое удаление через SQL UPDATE (без ORM) */
  async softDelete(id: number): Promise<void> {
    await this.nutrientRepository.query(
      `UPDATE nutrients SET status = 'удален' WHERE id = $1`,
      [id],
    );
  }

  /** Создание черновика через ORM */
  async createDraft(data: Partial<Nutrient>): Promise<Nutrient> {
    const nutrient = this.nutrientRepository.create({
      ...data,
      status: 'черновик',
      creatorId: 1,
    });
    return this.nutrientRepository.save(nutrient);
  }

  /** Публикация через ORM */
  async publish(id: number, data: Partial<Nutrient>): Promise<Nutrient | null> {
    await this.nutrientRepository.update(
      { id },
      { ...data, status: 'опубликован', formedAt: new Date() },
    );
    return this.nutrientRepository.findOne({ where: { id } });
  }
}