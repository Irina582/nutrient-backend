import {
  Controller, Get, Post, Param, Query, Render, Body,
  ParseIntPipe, NotFoundException, Redirect,
} from '@nestjs/common';
import { NutrientsService } from './nutrients.service';

@Controller('nutrients')
export class NutrientsController {
  constructor(private readonly nutrientsService: NutrientsService) {}

  // GET №1 — плитка
  @Get()
  @Render('tile')
  async getTile(
    @Query('minNorm') minNorm?: string,
    @Query('maxNorm') maxNorm?: string,
  ) {
    const parsedMin = minNorm ? Number(minNorm) : undefined;
    const parsedMax = maxNorm ? Number(maxNorm) : undefined;
    const list = await this.nutrientsService.findAllVisible(parsedMin, parsedMax);

    const nutrientsWithLikes = await Promise.all(
      list.map(async (n) => ({
        ...n,
        likesCount: await this.nutrientsService.countLikes(n),
      })),
    );

    return {
      title: 'Питательные вещества',
      minNorm: minNorm ?? '0',
      maxNorm: maxNorm ?? '150',
      nutrients: nutrientsWithLikes,
    };
  }

  // GET №2 — черновик (страница добавления)
  @Get('draft')
  @Render('add')
  async getDraft() {
    const draft = await this.nutrientsService.findDraft();
    return {
      title: 'Добавление',
      nutrient: draft ?? null,
    };
  }

  // GET №3 — лента без id
  @Get('feed')
  @Render('feed')
  async getFirstFeed() {
    const item = await this.nutrientsService.findFeedItem(undefined, false);
    if (!item) {
      return { title: 'Не найдено', nutrient: null, likesCount: 0 };
    }
    return {
      title: item.name,
      nutrient: item,
      likesCount: await this.nutrientsService.countLikes(item),
    };
  }

  // GET №3 (продолжение) — лента по id / следующий
  @Get('feed/:id')
  @Render('feed')
  async getFeed(@Param('id') id: string, @Query('next') next?: string) {
    const parsedId = Number(id);

    if (next !== 'true') {
      const cursorItem = await this.nutrientsService.getNutrientById(parsedId);
      if (cursorItem) {
        return {
          title: cursorItem.name,
          nutrient: cursorItem,
          likesCount: await this.nutrientsService.countLikes(cursorItem),
        };
      }
    }

    const item = await this.nutrientsService.findFeedItem(parsedId, next === 'true');
    if (!item) {
      return { title: 'Не найдено', nutrient: null, likesCount: 0 };
    }
    return {
      title: item.name,
      nutrient: item,
      likesCount: await this.nutrientsService.countLikes(item),
    };
  }

  // POST №1 — создание карточки (кнопка «Далее») через ORM
  @Post('create')
  @Redirect('/nutrients/draft', 302)
  async createDraft(@Body() body: any) {
    await this.nutrientsService.createDraft({
      name: body.name,
      category: '',
      dailyNorm: 0,
      unit: '',
      description: null,
      imageKey: null,
      videoKey: null,
    });
  }

  // POST №2 — публикация
  @Post('publish')
  @Redirect('/nutrients', 302)
  async publish(@Body() body: any) {
    const id = Number(body.id);
    if (!isNaN(id)) {
      await this.nutrientsService.publish(id, {
        category: body.category,
        description: body.description,
        dailyNorm: body.dailyNorm ? Number(body.dailyNorm) : 0,
        unit: body.unit,
      });
    }
  }

  // POST №3 — мягкое удаление через SQL UPDATE
  @Post('delete')
  @Redirect('/nutrients', 302)
  async delete(@Body('id') id: string) {
    const parsed = parseInt(id, 10);
    if (!isNaN(parsed)) {
      await this.nutrientsService.softDelete(parsed);
    }
  }
}