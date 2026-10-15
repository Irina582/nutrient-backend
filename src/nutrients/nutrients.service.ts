import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, MoreThanOrEqual, LessThanOrEqual, Not, MoreThan } from 'typeorm';
import { Nutrients } from './nutrients.entity';
import { NutrientsLike } from './nutrients_like.entity';
import { NutrientsMinioService } from './nutrients_minio.service';
import { NutrientsCreateDto } from './dto/nutrients_create.dto';
import { NutrientsPublishDto } from './dto/nutrients_publish.dto';
import { NutrientsFiltersDto } from './dto/nutrients_filters.dto';
import { NutrientsResponseDto } from './dto/nutrients_response.dto';

@Injectable()
export class NutrientsService {
  constructor(
    @InjectRepository(Nutrients)
    private nutrientsRepository: Repository<Nutrients>,
    @InjectRepository(NutrientsLike)
    private nutrientsLikeRepository: Repository<NutrientsLike>,
    private minioService: NutrientsMinioService,
  ) {}

  async findAll(filters: NutrientsFiltersDto, userId: number | null): Promise<NutrientsResponseDto[]> {
    const qb = this.nutrientsRepository.createQueryBuilder('n');
    qb.where('n.status = :status', { status: 'опубликован' });
    if (filters.search) {
      qb.andWhere('n.name ILIKE :search', { search: `%${filters.search}%` });
    }
    if (filters.minNorm !== undefined) {
      qb.andWhere('n.dailyNorm >= :minNorm', { minNorm: filters.minNorm });
    }
    if (filters.maxNorm !== undefined) {
      qb.andWhere('n.dailyNorm <= :maxNorm', { maxNorm: filters.maxNorm });
    }
    const nutrients = await qb.getMany();
    return Promise.all(nutrients.map((n_item) => this.toResponseDto(n_item, userId)));
  }

  async findFeed(id: number, next: boolean, userId: number | null): Promise<NutrientsResponseDto> {
    let nutrient: Nutrients | null = null;

    if (next) {
      nutrient = await this.nutrientsRepository.findOne({
        where: { status: 'опубликован', id: MoreThan(id) },
        order: { id: 'ASC' },
      });
      if (!nutrient) {
        nutrient = await this.nutrientsRepository.findOne({
          where: { status: 'опубликован' },
          order: { id: 'ASC' },
        });
      }
    } else {
      nutrient = await this.nutrientsRepository.findOne({
        where: { id, status: 'опубликован' },
      });
    }

    if (!nutrient) throw new NotFoundException();
    return this.toResponseDto(nutrient, userId);
  }

  async findDraft(userId: number): Promise<NutrientsResponseDto | null> {
    const draft = await this.nutrientsRepository.findOne({
      where: { status: 'черновик', creatorId: userId },
    });
    return draft ? this.toResponseDto(draft, userId) : null;
  }

  async createDraft(
    dto: NutrientsCreateDto,
    files: { image?: Express.Multer.File[]; video?: Express.Multer.File[] },
    userId: number,
  ): Promise<NutrientsResponseDto> {
    const existingDraft = await this.nutrientsRepository.findOne({
      where: { status: 'черновик', creatorId: userId },
    });
    if (existingDraft) {
      throw new BadRequestException();
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

    const nutrient = this.nutrientsRepository.create({
      ...dto,
      status: 'черновик',
      creatorId: userId,
      imageKey,
      videoKey,
    });
    
    await this.nutrientsRepository.save(nutrient);
    return this.toResponseDto(nutrient, userId);
  }

  async publish(
    id: number,
    dto: NutrientsPublishDto,
    userId: number,
  ): Promise<NutrientsResponseDto> {
    const nutrient = await this.nutrientsRepository.findOne({
      where: { id, status: 'черновик', creatorId: userId },
    });
    if (!nutrient) throw new NotFoundException();

    nutrient.dailyNorm = dto.dailyNorm;
    nutrient.unit = dto.unit;
    if (dto.description !== undefined) nutrient.description = dto.description;
    nutrient.status = 'опубликован';
    nutrient.formedAt = new Date();

    await this.nutrientsRepository.save(nutrient);
    return this.toResponseDto(nutrient, userId);
  }

  async softDelete(id: number, userId: number): Promise<void> {
    const nutrient = await this.nutrientsRepository.findOne({
      where: { id, creatorId: userId, status: Not('удален') },
    });
    if (!nutrient) throw new NotFoundException();

    nutrient.status = 'удален';
    await this.nutrientsRepository.save(nutrient);
  }

  async toggleLike(nutrientId: number, value: number, userId: number): Promise<void> {
    const nutrient = await this.nutrientsRepository.findOne({
      where: { id: nutrientId, status: 'опубликован' },
    });
    if (!nutrient) throw new NotFoundException('Нутриент не найден');

    if (value === 1) {
      const existingLike = await this.nutrientsLikeRepository.findOne({
        where: { userId, nutrientId },
      });
      if (!existingLike) {
        const like = this.nutrientsLikeRepository.create({ userId, nutrientId });
        await this.nutrientsLikeRepository.save(like);
      }
    } else if (value === 0) {
      await this.nutrientsLikeRepository.delete({ userId, nutrientId });
    } else {
      throw new BadRequestException();
    }
  }

  private async toResponseDto(
    nutrient: Nutrients,
    userId: number | null,
  ): Promise<NutrientsResponseDto> {
    const imageUrl = await this.minioService.getSignedUrl(nutrient.imageKey);
    const videoUrl = await this.minioService.getSignedUrl(nutrient.videoKey);

    const likesCount = await this.nutrientsLikeRepository.count({
      where: { nutrientId: nutrient.id },
    });

    let isLiked: 0 | 1 = 0;
    if (userId) {
      const existingLike = await this.nutrientsLikeRepository.findOne({
        where: { userId, nutrientId: nutrient.id },
      });
      isLiked = existingLike ? 1 : 0;
    }

    return {
      id: nutrient.id,
      name: nutrient.name,
      description: nutrient.description,
      dailyNorm: nutrient.dailyNorm ?? 0,  // <-- Если пусто, вернет 0
      unit: nutrient.unit ?? '',           // <-- Если пусто, вернет пустую строку ""
      imageKey: imageUrl || nutrient.imageKey,
      videoKey: videoUrl || nutrient.videoKey,
      likesCount,
      isLiked,
      isCreator: userId === nutrient.creatorId ? 1 : 0,
      createdAt: nutrient.createdAt,
      formedAt: nutrient.formedAt,
      creatorId: nutrient.creatorId,
    };
  }
}