import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
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

  /** Лента по id / следующий — через ORM, из БД берётся 1 строка */
  async findFeedItem(id?: number, next?: boolean): Promise<Nutrient | undefined> {
    // 1. Лента без id — самый первый опубликованный
    if (!id) {
      const first = await this.nutrientRepository
        .createQueryBuilder('n')
        .where('n.status = :status', { status: 'опубликован' })
        .orderBy('n.id', 'ASC')
        .limit(1)
        .getOne();
      return first ?? undefined;
    }

    // 2. Лента с ?next=true — следующий после id
    if (next) {
      const nextItem = await this.nutrientRepository
        .createQueryBuilder('n')
        .where('n.status = :status', { status: 'опубликован' })
        .andWhere('n.id > :id', { id })
        .orderBy('n.id', 'ASC')
        .limit(1)
        .getOne();

      if (nextItem) return nextItem;

      // Если после id ничего нет — циклически возвращаемся к первому
      const first = await this.nutrientRepository
        .createQueryBuilder('n')
        .where('n.status = :status', { status: 'опубликован' })
        .orderBy('n.id', 'ASC')
        .limit(1)
        .getOne();
      return first ?? undefined;
    }

    // 3. Лента по конкретному id
    const item = await this.nutrientRepository
      .createQueryBuilder('n')
      .where('n.status = :status', { status: 'опубликован' })
      .andWhere('n.id = :id', { id })
      .limit(1)
      .getOne();
    return item ?? undefined;
  }

  /** Количество лайков — через ORM */
  async countLikes(nutrient: Nutrient): Promise<number> {
    return this.likeRepository.count({ where: { nutrientId: nutrient.id } });
  }

  /** Получение одной услуги по id — через ORM */
  async getNutrientById(id: number): Promise<Nutrient | null> {
    return this.nutrientRepository.findOne({
      where: {
        id,
        status: Not('удален'),
      },
    });
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