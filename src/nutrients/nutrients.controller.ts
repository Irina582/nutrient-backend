import { Controller, Get, Param, Query, Render } from '@nestjs/common';
import { NutrientsService } from './nutrients.service';

@Controller('nutrients')
export class NutrientsController {
  constructor(private readonly nutrientsService: NutrientsService) {}

  // плитка
  @Get()
  @Render('tile')
  getTile(@Query('minNorm') minNorm?: string) {
    const parsedNorm = minNorm ? Number(minNorm) : undefined;
    const list = this.nutrientsService.findAllVisible(parsedNorm);
    const nutrientsWithLikes = list.map((n) => ({
      ...n,
      likesCount: this.nutrientsService.countLikes(n),
    }));
    return {
      title: 'Питательные вещества',
      minNorm: minNorm ?? '',
      nutrients: nutrientsWithLikes,
    };
  }

  // добавление
  @Get('draft')
  @Render('add')
  getDraft() {
    const draft = this.nutrientsService.findDraft();
    return {
      title: 'Добавление',
      nutrient: draft,
    };
  }

  // лента(без id-первый элемент)
  @Get('feed')
  @Render('feed')
  getFirstFeed() {
    const item = this.nutrientsService.findFeedItem(undefined, false);
    if (!item) {
      return { title: 'Не найдено', nutrient: null, likesCount: 0 };
    }
    return {
      title: item.name,
      nutrient: item,
      likesCount: this.nutrientsService.countLikes(item),
    };
  }

  // лента(с id-конкретный элемент или следующий)
  @Get('feed/:id')
  @Render('feed')
  getFeed(@Param('id') id: string, @Query('next') next?: string) {
    const parsedId = Number(id);
    const item = this.nutrientsService.findFeedItem(parsedId, next === 'true');
    if (!item) {
      return { title: 'Не найдено', nutrient: null, likesCount: 0 };
    }
    return {
      title: item.name,
      nutrient: item,
      likesCount: this.nutrientsService.countLikes(item),
    };
  }
}