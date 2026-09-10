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
      description: 'Поддерживает иммунитет и синтез коллагена. Также он является мощным антиоксидантом, который защищает клетки от повреждений свободными радикалами. Отлично усваивается из цитрусовых, киви, шиповника и черной смородины. Регулярное употребление помогает бороться с усталостью и улучшает усвоение железа.',
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
      description: 'Главный строительный материал для всех клеток, тканей и органов нашего тела. Он критически важен для роста мышц, восстановления после тренировок и выработки ферментов. Лучшие источники: мясо птицы, рыба, яйца, творог, а также бобовые и орехи для вегетарианцев. Обеспечивает долгое чувство сытости.',
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
      description: 'Участвует в переносе кислорода в составе гемоглобина ко всем органам и тканям. Достаточный уровень железа предотвращает анемию, хроническую слабость и головокружения. Гемовое железо (из красного мяса и печени) усваивается лучше всего, а растительное (из яблок, гречки, шпината) рекомендуется употреблять вместе с витамином С.',
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
      description: 'Сложный углевод, который не переваривается, но служит пищей для полезных бактерий в кишечнике. Нормализует пищеварение, помогает контролировать вес и снижает уровень сахара и холестерина в крови. Содержится в цельнозерновых крупах, свежих овощах, фруктах с кожурой и отрубях.',
      status: 'черновик',  
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
      description: 'Полиненасыщенные жирные кислоты, незаменимые для здоровья сердечно-сосудистой системы и мозга. Они уменьшают воспаления в организме, улучшают память и поддерживают здоровье суставов и кожи. Главный источник — жирная морская рыба (лосось, скумбрия, сельдь), а также льняное семя и грецкие орехи.',
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
      description: 'Необходим для прочности костей и зубов, особенно в период роста и в старшем возрасте. Помимо этого, кальций регулирует мышечные сокращения и передачу нервных импульсов. Основные источники: молочные продукты, кунжут, миндаль и темно-зеленые листовые овощи. Для хорошего усвоения требуется витамин D.',
      status: 'удален',  
      imageKey: 'calcium.jpg',
      videoKey: 'calcium.mp4',
      likedByUserIds: [],
    },
  ];

  private visible(): Nutrient[] {
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