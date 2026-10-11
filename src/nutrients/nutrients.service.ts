import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Nutrients } from './nutrients.model';
import { NutrientsLike } from './nutrients_like.model';
import { NutrientsMinioService } from './nutrients_minio.service';
import { NutrientsCreateDto } from './dto/nutrients_create.dto';
import { NutrientsPublishDto } from './dto/nutrients_publish.dto';
import { NutrientsFiltersDto } from './dto/nutrients_filters.dto';
import { NutrientsResponseDto } from './dto/nutrients_response.dto';

@Injectable()
export class NutrientsService {
  constructor(
    @InjectModel(Nutrients)
    private nutrientsModel: typeof Nutrients,
    @InjectModel(NutrientsLike)
    private nutrientsLikeModel: typeof NutrientsLike,
    private minioService: NutrientsMinioService,
  ) {}

  async findAll(filters: NutrientsFiltersDto): Promise<NutrientsResponseDto[]> {
    const where: any = { status: 'опубликован' };

    if (filters.search) {
      where.name = { [Op.iLike]: `%${filters.search}%` };
    }
    if (filters.minNorm !== undefined) {
      where.dailyNorm = { ...where.dailyNorm, [Op.gte]: filters.minNorm };
    }
    if (filters.maxNorm !== undefined) {
      where.dailyNorm = { ...where.dailyNorm, [Op.lte]: filters.maxNorm };
    }

    const nutrients = await this.nutrientsModel.findAll({ where });
    return Promise.all(nutrients.map((n) => this.toResponseDto(n, null)));
  }

  async findFeed(id: number, next: boolean): Promise<NutrientsResponseDto> {
    let nutrient: Nutrients | null = null;

    if (next) {
      nutrient = await this.nutrientsModel.findOne({
        where: { status: 'опубликован', id: { [Op.gt]: id } },
        order: [['id', 'ASC']],
      });
      if (!nutrient) {
        nutrient = await this.nutrientsModel.findOne({
          where: { status: 'опубликован' },
          order: [['id', 'ASC']],
        });
      }
    } else {
      nutrient = await this.nutrientsModel.findOne({
        where: { id, status: 'опубликован' },
      });
    }

    if (!nutrient) throw new NotFoundException('Нутриент не найден');
    return this.toResponseDto(nutrient, null);
  }

  async findDraft(userId: number): Promise<NutrientsResponseDto | null> {
    const draft = await this.nutrientsModel.findOne({
      where: { status: 'черновик', creatorId: userId },
    });
    return draft ? this.toResponseDto(draft, userId) : null;
  }

  async findOne(id: number): Promise<NutrientsResponseDto> {
    const nutrient = await this.nutrientsModel.findOne({
      where: { id, status: { [Op.ne]: 'удален' } },
    });
    if (!nutrient) throw new NotFoundException(`Нутриент с ID ${id} не найден`);
    return this.toResponseDto(nutrient, null);
  }

  async createDraft(
    dto: NutrientsCreateDto,
    files: { image?: Express.Multer.File[]; video?: Express.Multer.File[] },
    userId: number,
  ): Promise<NutrientsResponseDto> {
    const existingDraft = await this.nutrientsModel.findOne({
      where: { status: 'черновик', creatorId: userId },
    });
    if (existingDraft) {
      throw new BadRequestException('У пользователя уже есть черновик');
    }

    let imageKey = '';
    let videoKey = '';

    if (files.image?.[0]) {
      imageKey = await this.minioService.uploadFile(
        files.image[0].buffer,
        files.image[0].originalname,
        files.image[0].mimetype,
      );
    }
    if (files.video?.[0]) {
      videoKey = await this.minioService.uploadFile(
        files.video[0].buffer,
        files.video[0].originalname,
        files.video[0].mimetype,
      );
    }

    const nutrient = await this.nutrientsModel.create({
      ...dto,
      status: 'черновик',
      creatorId: userId,
      imageKey,
      videoKey,
    } as any);

    return this.toResponseDto(nutrient, userId);
  }

  async publish(
    id: number,
    dto: NutrientsPublishDto,
    userId: number,
  ): Promise<NutrientsResponseDto> {
    const nutrient = await this.nutrientsModel.findOne({
      where: { id, status: 'черновик', creatorId: userId },
    });
    if (!nutrient) throw new NotFoundException('Черновик не найден');

    nutrient.dailyNorm = dto.dailyNorm;
    nutrient.unit = dto.unit;
    if (dto.description !== undefined) nutrient.description = dto.description;
    nutrient.status = 'опубликован';
    nutrient.formedAt = new Date();

    await nutrient.save();
    return this.toResponseDto(nutrient, userId);
  }

  async softDelete(id: number, userId: number): Promise<void> {
    const nutrient = await this.nutrientsModel.findOne({
      where: { id, creatorId: userId, status: { [Op.ne]: 'удален' } },
    });
    if (!nutrient) throw new NotFoundException('Нутриент не найден');

    nutrient.status = 'удален';
    await nutrient.save();
  }

  async toggleLike(nutrientId: number, value: number, userId: number): Promise<void> {
    const nutrient = await this.nutrientsModel.findOne({
      where: { id: nutrientId, status: 'опубликован' },
    });
    if (!nutrient) throw new NotFoundException('Нутриент не найден');

    if (value === 1) {
      const existingLike = await this.nutrientsLikeModel.findOne({
        where: { userId, nutrientId },
      });
      if (!existingLike) {
        await this.nutrientsLikeModel.create({ userId, nutrientId } as any);
      }
    } else if (value === 0) {
      await this.nutrientsLikeModel.destroy({ where: { userId, nutrientId } });
    } else {
      throw new BadRequestException('Значение лайка должно быть 0 или 1');
    }
  }

  private async toResponseDto(
    nutrient: Nutrients,
    userId: number | null,
  ): Promise<NutrientsResponseDto> {
    const imageUrl = await this.minioService.getSignedUrl(nutrient.imageKey);
    const videoUrl = await this.minioService.getSignedUrl(nutrient.videoKey);

    const likesCount = await this.nutrientsLikeModel.count({
      where: { nutrientId: nutrient.id },
    });

    let isLiked: 0 | 1 = 0;
    if (userId) {
      const existingLike = await this.nutrientsLikeModel.findOne({
        where: { userId, nutrientId: nutrient.id },
      });
      isLiked = existingLike ? 1 : 0;
    }

    return {
      id: nutrient.id,
      name: nutrient.name,
      description: nutrient.description,
      dailyNorm: nutrient.dailyNorm,
      unit: nutrient.unit,
      imageKey: imageUrl || nutrient.imageKey,
      videoKey: videoUrl || nutrient.videoKey,
      likesCount,
      isLiked,
      createdAt: nutrient.createdAt,
      formedAt: nutrient.formedAt,
      creatorId: nutrient.creatorId,
    };
  }
}