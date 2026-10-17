import {
  Controller, Get, Post, Put, Delete, Param, Query, Body,
  ParseIntPipe, UseInterceptors, UploadedFiles, BadRequestException,
  HttpCode, HttpStatus, UseGuards, Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { NutrientsService } from './nutrients.service';
import { NutrientsCreateDto } from './dto/nutrients_create.dto';
import { NutrientsPublishDto } from './dto/nutrients_publish.dto';
import { NutrientsFiltersDto } from './dto/nutrients_filters.dto';
import { NutrientsResponseDto } from './dto/nutrients_response.dto';
import { SessionGuard } from '../auth/guards/session.guard';
import { SessionService } from '../session/session.service';

@Controller('api/nutrients')
export class NutrientsController {
  constructor(
    private readonly nutrientsService: NutrientsService,
    private readonly sessionService: SessionService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Получение списка опубликованных нутриентов с фильтрацией' })
  async findAll(
    @Query() filters: NutrientsFiltersDto,
    @Req() req: Request,
  ): Promise<NutrientsResponseDto[]> {
    let userId: number | null = null;
    const sessionId = req.cookies?.sessionId;
    if (sessionId) {
      userId = await this.sessionService.getUserId(sessionId);
    }
    return this.nutrientsService.findAll(filters, userId);
  }

  @Get('feed')
  @ApiOperation({ summary: 'Получение ленты (открытие карточки или следующей)' })
  async getFeed(
    @Req() req: Request,
    @Query('id') idStr?: string,
    @Query('next') nextStr?: string,
  ): Promise<NutrientsResponseDto> {
    if (!idStr && nextStr !== 'true') {
      throw new BadRequestException(); 
    }

    const id = idStr ? parseInt(idStr, 10) : undefined;
    const next = nextStr === 'true';

    let userId: number | null = null;
    const sessionId = req.cookies?.sessionId;
    if (sessionId) {
      userId = await this.sessionService.getUserId(sessionId);
    }
    
    return this.nutrientsService.findFeed(id, next, userId);
  }

  @Get('draft')
  @UseGuards(SessionGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Получение черновика авторизованного пользователя' })
  async getDraft(
    @Req() req: Request & { session: { userId: number } },
  ): Promise<NutrientsResponseDto | null> {
    return this.nutrientsService.findDraft(req.session.userId);
  }

  @Post()
  @UseGuards(SessionGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Добавление нового нутриента (черновика) с медиа' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'video', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        limits: { fileSize: 50 * 1024 * 1024 },
        fileFilter: (req, file, callback) => {
          if (file.fieldname === 'image' && !file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
            return callback(new BadRequestException(), false);
          }
          if (file.fieldname === 'video' && !file.mimetype.match(/\/(mp4|webm|ogg)$/)) {
            return callback(new BadRequestException(), false);
          }
          callback(null, true);
        },
      },
    ),
  )
  async create(
    @Body() dto: NutrientsCreateDto,
    @UploadedFiles() files: { image?: Express.Multer.File[]; video?: Express.Multer.File[] },
    @Req() req: Request & { session: { userId: number } },
  ): Promise<NutrientsResponseDto> {
    return this.nutrientsService.createDraft(dto, files, req.session.userId);
  }

  @Put(':id/publish')
  @UseGuards(SessionGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Публикация черновика нутриента' })
  async publish(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: NutrientsPublishDto,
    @Req() req: Request & { session: { userId: number } },
  ): Promise<NutrientsResponseDto> {
    return this.nutrientsService.publish(id, dto, req.session.userId);
  }

  @Delete(':id')
  @UseGuards(SessionGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Логическое удаление нутриента' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { session: { userId: number } },
  ): Promise<void> {
    await this.nutrientsService.softDelete(id, req.session.userId);
  }

  @Post(':id/like')
  @UseGuards(SessionGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Управление лайками (0 или 1)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async like(
    @Param('id', ParseIntPipe) id: number,
    @Body('value') value: number,
    @Req() req: Request & { session: { userId: number } },
  ): Promise<void> {
    await this.nutrientsService.toggleLike(id, value, req.session.userId);
  }
}