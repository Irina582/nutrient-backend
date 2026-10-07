import {
  Controller, Get, Post, Put, Delete, Param, Query, Body,
  ParseIntPipe, UseInterceptors, UploadedFiles, BadRequestException,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { NutrientsService } from './nutrients.service';
import { CreateNutrientDto } from './dto/create-nutrient.dto';
import { PublishNutrientDto } from './dto/publish-nutrient.dto';
import { NutrientFiltersDto } from './dto/nutrient-filters.dto';
import { NutrientResponseDto } from './dto/nutrient-response.dto';

@Controller('nutrients')
export class NutrientsController {
  constructor(private readonly nutrientsService: NutrientsService) {}

  // GET /api/nutrients?search=&minNorm=&maxNorm=
  @Get()
  async findAll(@Query() filters: NutrientFiltersDto): Promise<NutrientResponseDto[]> {
    return this.nutrientsService.findAll(filters);
  }

  // GET /api/nutrients/feed/:id           — один нутриент по id
  // GET /api/nutrients/feed/:id?next=true — следующий после id
  // GET /api/nutrients/feed               — НЕ существует (404)
  @Get('feed/:id')
  async getFeedById(
    @Param('id', ParseIntPipe) id: number,
    @Query('next') next?: string,
  ): Promise<NutrientResponseDto> {
    return this.nutrientsService.findFeed(id, next === 'true');
  }

  // GET /api/nutrients/draft
  @Get('draft')
  async getDraft(): Promise<NutrientResponseDto | null> {
    return this.nutrientsService.findDraft();
  }

  // GET /api/nutrients/:id
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<NutrientResponseDto> {
    return this.nutrientsService.findOne(id);
  }

  // POST /api/nutrients — только name, image, video
  @Post()
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
            return callback(new BadRequestException('Только изображения'), false);
          }
          if (file.fieldname === 'video' && !file.mimetype.match(/\/(mp4|webm|ogg)$/)) {
            return callback(new BadRequestException('Только видео'), false);
          }
          callback(null, true);
        },
      },
    ),
  )
  async create(
    @Body() dto: CreateNutrientDto,
    @UploadedFiles() files: { image?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ): Promise<NutrientResponseDto> {
    return this.nutrientsService.createDraft(dto, files);
  }

  // PUT /api/nutrients/:id/publish — принимает PublishNutrientDto
  @Put(':id/publish')
  async publish(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PublishNutrientDto,
  ): Promise<NutrientResponseDto> {
    return this.nutrientsService.publish(id, dto);
  }

  // DELETE /api/nutrients/:id → 204
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.nutrientsService.softDelete(id);
  }

  // POST /api/nutrients/:id/like → 204
  @Post(':id/like')
  @HttpCode(HttpStatus.NO_CONTENT)
  async like(
    @Param('id', ParseIntPipe) id: number,
    @Body('value') value: number,
  ): Promise<void> {
    await this.nutrientsService.toggleLike(id, value);
  }
}