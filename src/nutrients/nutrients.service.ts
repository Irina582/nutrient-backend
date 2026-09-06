import { Injectable } from '@nestjs/common';
import { Nutrient } from './nutrients.model';

@Injectable()
export class NutrientsService {
  private readonly nutrients: Nutrient[] = [
    {
      id: 1,
      name: 'Витамин C',
      category: 'Витамины',
      dailyNorm: 90,
      unit: 'мг',
      description: 'Поддерживает иммунитет и синтез коллагена.',
      status: 'опубликован',
      imageKey: 'vitamin-c.jpg',
      videoKey: 'vitamin-c.mp4',
      likedByUserIds: [1, 4, 10],
    },
    {
      id: 2,
      name: 'Белок',
      category: 'Белки',
      dailyNorm: 90,
      unit: 'г',
      description: 'Строительный материал для клеток и тканей.',
      status: 'опубликован',
      imageKey: 'protein.jpg',
      videoKey: 'protein.mp4',
      likedByUserIds: [2, 3],
    },
    {
      id: 3,
      name: 'Железо',
      category: 'Минералы',
      dailyNorm: 18,
      unit: 'мг',
      description: 'Участвует в переносе кислорода в составе гемоглобина.',
      status: 'опубликован',
      imageKey: 'iron.jpg',
      videoKey: 'iron.mp4',
      likedByUserIds: [],
    },
    {
      id: 4,
      name: 'Клетчатка',
      category: 'Углеводы',
      dailyNorm: 30,
      unit: 'г',
      description: 'Нормализует пищеварение и уровень сахара в крови.',
      status: 'черновик',  // ← ЭТОТ НЕ БУДЕТ В ПЛИТКЕ И ЛЕНТЕ
      imageKey: 'fiber.jpg',
      videoKey: 'fiber.mp4',
      likedByUserIds: [],
    },
    {
      id: 5,
      name: 'Омега-3',
      category: 'Жиры',
      dailyNorm: 1.6,
      unit: 'г',
      description: 'Полиненасыщенные жирные кислоты, полезные для сердца.',
      status: 'опубликован',
      imageKey: 'omega3.jpg',
      videoKey: 'omega3.mp4',
      likedByUserIds: [5, 6, 7],
    },
    {
      id: 6,
      name: 'Кальций',
      category: 'Минералы',
      dailyNorm: 1000,
      unit: 'мг',
      description: 'Необходим для здоровья костей и зубов.',
      status: 'удален',  // ← ЭТОТ НЕ БУДЕТ НИГДЕ
      imageKey: 'calcium.jpg',
      videoKey: 'calcium.mp4',
      likedByUserIds: [],
    },
  ];

  private visible(): Nutrient[] {
    // ТОЛЬКО опубликованные!
    return this.nutrients.filter((n) => n.status === 'опубликован');
  }

  findAllVisible(minNorm?: number): Nutrient[] {
    return this.visible().filter(
      (n) => (minNorm ? n.dailyNorm >= minNorm : true),
    );
  }

  findDraft(): Nutrient | undefined {
    return this.nutrients.find((n) => n.status === 'черновик');
  }

  findFeedItem(id?: number, next?: boolean): Nutrient | undefined {
    const list = this.visible();
    if (!id) return list[0];

    if (next) {
      const currentIndex = list.findIndex((n) => n.id === id);
      if (currentIndex === -1) return list[0];
      return list[currentIndex + 1] ?? list[0];
    }

    return list.find((n) => n.id === id);
  }

  countLikes(nutrient: Nutrient): number {
    return nutrient.likedByUserIds.length;
  }
}