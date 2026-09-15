import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Render,
  Res,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { NutrientsService } from './nutrients.service';
import { CreateNutrientDto } from './dto/create-nutrient.dto';
import { PublishNutrientDto } from './dto/publish-nutrient.dto';

@Controller('nutrients')
export class NutrientsController {
  constructor(private readonly nutrientsService: NutrientsService) {}

  // GET плитка (фильтр по minNorm и maxNorm)
  @Get()
  @Render('tile')
  async getTile(
    @Query('minNorm') minNorm?: string,
    @Query('maxNorm') maxNorm?: string,
  ) {
    const parsedMin = minNorm !== undefined && minNorm !== '' ? Number(minNorm) : undefined;
    const parsedMax = maxNorm !== undefined && maxNorm !== '' ? Number(maxNorm) : undefined;
    const nutrients = await this.nutrientsService.findAllVisible(parsedMin, parsedMax);
    return {
      title: 'Питательные вещества',
      minNorm: minNorm ?? '0',
      maxNorm: maxNorm ?? '150',
      nutrients,
    };
  }

  // GET страница "Добавление"
  @Get('draft')
  @Render('add')
  async getDraft() {
    const draft = await this.nutrientsService.findDraft();
    return { title: 'Добавление', nutrient: draft };
  }

  // POST создать черновик (кнопка "Далее")
  @Post('draft')
  @Render('add')
  async createDraft() {
    let draft = await this.nutrientsService.findDraft();
    if (!draft) {
      draft = await this.nutrientsService.create(
        { name: 'Новая услуга', shortDescription: '', dailyNorm: 0, unit: '', category: '' },
        1,
      );
    }
    return { title: 'Добавление', nutrient: draft };
  }

  // POST опубликовать черновик (кнопка "Опубликовать")
  @Post('draft/publish')
  @Render('add')
  async publishDraft(@Body() dto: PublishNutrientDto) {
    const draft = await this.nutrientsService.findDraft();
    if (!draft) {
      return { title: 'Добавление', nutrient: null };
    }
    await this.nutrientsService.publish(draft.id, dto);
    return { title: 'Добавление', nutrient: null };
  }

  // GET лента (первый элемент)
  @Get('feed')
  @Render('feed')
  async getFirstFeed() {
    const item = await this.nutrientsService.findFeedItem();
    if (!item) return { title: 'Не найдено', nutrient: null, likesCount: 0 };
    const likesCount = await this.nutrientsService.countLikes(item.id);
    return { title: item.name, nutrient: item, likesCount };
  }

  // GET лента (конкретный элемент или следующий)
  @Get('feed/:id')
  @Render('feed')
  async getFeed(@Param('id') id: string, @Query('next') next?: string) {
    const parsedId = Number(id);
    const item = await this.nutrientsService.findFeedItem(parsedId, next === 'true');
    if (!item) return { title: 'Не найдено', nutrient: null, likesCount: 0 };
    const likesCount = await this.nutrientsService.countLikes(item.id);
    return { title: item.name, nutrient: item, likesCount };
  }

  // POST создание услуги (JSON, ORM) — для Postman
  @Post()
  async create(@Body() dto: CreateNutrientDto, @Res() res: Response) {
    const nutrient = await this.nutrientsService.create(dto, 1);
    return res.status(HttpStatus.CREATED).json(nutrient);
  }

  // POST публикация через JSON (ORM) — для Postman
  @Post(':id/publish')
  async publish(
    @Param('id') id: string,
    @Body() dto: PublishNutrientDto,
    @Res() res: Response,
  ) {
    const nutrient = await this.nutrientsService.publish(Number(id), dto);
    if (!nutrient) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: 'Не найдено' });
    }
    return res.json(nutrient);
  }

  // POST удаление через SQL-курсор (сложный запрос)
  @Post(':id/delete-cursor')
  async deleteCursor(@Param('id') id: string, @Res() res: Response) {
    const ok = await this.nutrientsService.deleteWithCursor(Number(id));
    if (!ok) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: 'Не найдено' });
    }
    return res.json({ success: true });
  }

  // POST логическое удаление (чистый SQL UPDATE, без ORM)
  @Post(':id/soft-delete')
  async softDelete(@Param('id') id: string, @Res() res: Response) {
    const ok = await this.nutrientsService.softDelete(Number(id));
    if (!ok) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: 'Не найдено' });
    }
    return res.json({ success: true });
  }
}