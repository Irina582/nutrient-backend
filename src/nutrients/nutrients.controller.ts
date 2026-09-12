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

  @Get()
  @Render('tile')
  async getTile(@Query('minNorm') minNorm?: string) {
    const parsedNorm = minNorm ? Number(minNorm) : undefined;
    const nutrients = await this.nutrientsService.findAllVisible(parsedNorm);
    return {
      title: 'Питательные вещества',
      minNorm: minNorm ?? '',
      nutrients,
    };
  }

  @Get('draft')
  @Render('add')
  async getDraft() {
    const draft = await this.nutrientsService.findDraft();
    return {
      title: 'Добавление',
      nutrient: draft,
    };
  }

  @Get('feed')
  @Render('feed')
  async getFirstFeed() {
    const item = await this.nutrientsService.findFeedItem();
    if (!item) {
      return { title: 'Не найдено', nutrient: null, likesCount: 0 };
    }
    const likesCount = await this.nutrientsService.countLikes(item.id);
    return { title: item.name, nutrient: item, likesCount };
  }

  @Get('feed/:id')
  @Render('feed')
  async getFeed(@Param('id') id: string, @Query('next') next?: string) {
    const parsedId = Number(id);
    const item = await this.nutrientsService.findFeedItem(
      parsedId,
      next === 'true',
    );
    if (!item) {
      return { title: 'Не найдено', nutrient: null, likesCount: 0 };
    }
    const likesCount = await this.nutrientsService.countLikes(item.id);
    return { title: item.name, nutrient: item, likesCount };
  }

  @Post()
  async create(@Body() dto: CreateNutrientDto, @Res() res: Response) {
    const nutrient = await this.nutrientsService.create(dto, 1);
    return res.status(HttpStatus.CREATED).json(nutrient);
  }

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

  @Post(':id/delete-cursor')
  async deleteCursor(@Param('id') id: string, @Res() res: Response) {
    const ok = await this.nutrientsService.deleteWithCursor(Number(id));
    if (!ok) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: 'Не найдено' });
    }
    return res.json({ success: true });
  }

  @Post(':id/soft-delete')
  async softDelete(@Param('id') id: string, @Res() res: Response) {
    const ok = await this.nutrientsService.softDelete(Number(id));
    if (!ok) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: 'Не найдено' });
    }
    return res.json({ success: true });
  }
}