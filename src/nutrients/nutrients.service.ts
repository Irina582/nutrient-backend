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

  async findDraft(): Promise<Nutrient | undefined> {
    const draft = await this.nutrientRepository.findOne({
      where: { status: 'черновик', creatorId: 1 },
    });
    return draft ?? undefined;
  }

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

  async countLikes(nutrient: Nutrient): Promise<number> {
    return this.likeRepository.count({ where: { nutrientId: nutrient.id } });
  }

  async getNutrientById(id: number): Promise<Nutrient | null> {
    return this.nutrientRepository.findOne({
      where: {
        id,
        status: Not('удален'),
      },
    });
  }

  async softDelete(id: number): Promise<void> {
    await this.nutrientRepository.query(
      `UPDATE nutrients SET status = 'удален' WHERE id = $1`,
      [id],
    );
  }

  async createDraft(data: Partial<Nutrient>): Promise<Nutrient> {
    const nutrient = this.nutrientRepository.create({
      ...data,
      status: 'черновик',
      creatorId: 1,
    });
    return this.nutrientRepository.save(nutrient);
  }

  async publish(id: number, data: Partial<Nutrient>): Promise<Nutrient | null> {
    await this.nutrientRepository.update(
      { id },
      { ...data, status: 'опубликован', formedAt: new Date() },
    );
    return this.nutrientRepository.findOne({ where: { id } });
  }
}