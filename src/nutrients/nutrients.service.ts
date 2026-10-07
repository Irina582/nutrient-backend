import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Nutrient } from './entities/nutrient.entity';
import { Like as LikeEntity } from './entities/like.entity';
import { MinioService } from './minio.service';
import { CreateNutrientDto } from './dto/create-nutrient.dto';
import { PublishNutrientDto } from './dto/publish-nutrient.dto';
import { NutrientFiltersDto } from './dto/nutrient-filters.dto';
import { NutrientResponseDto } from './dto/nutrient-response.dto';
import { getCurrentCreatorId } from '../common/current-user';

@Injectable()
export class NutrientsService {
  constructor(
    @InjectRepository(Nutrient)
    private nutrientRepository: Repository<Nutrient>,
    @InjectRepository(LikeEntity)
    private likeRepository: Repository<LikeEntity>,
    private minioService: MinioService,
  ) {}

  // GET /api/nutrients — только опубликованные, с фильтрами
  async findAll(filters: NutrientFiltersDto): Promise<NutrientResponseDto[]> {
    const query = this.nutrientRepository
      .createQueryBuilder('n')
      .where('n.status = :status', { status: 'опубликован' });

    if (filters.search) {
      query.andWhere('n.name ILIKE :search', { search: `%${filters.search}%` });
    }
    if (filters.minNorm !== undefined) {
      query.andWhere('n."dailyNorm" >= :minNorm', { minNorm: filters.minNorm });
    }
    if (filters.maxNorm !== undefined) {
      query.andWhere('n."dailyNorm" <= :maxNorm', { maxNorm: filters.maxNorm });
    }

    const nutrients = await query.getMany();
    return Promise.all(nutrients.map((n) => this.toResponseDto(n)));
  }

  async findFeed(id: number, next: boolean): Promise<NutrientResponseDto> {
    let nutrient: Nutrient | null = null;

    if (next) {
      nutrient = await this.nutrientRepository
        .createQueryBuilder('n')
        .where('n.status = :status', { status: 'опубликован' })
        .andWhere('n.id > :id', { id })
        .orderBy('n.id', 'ASC')
        .getOne();

      if (!nutrient) {
        nutrient = await this.nutrientRepository.findOne({
          where: { status: 'опубликован' },
          order: { id: 'ASC' },
        });
      }
    } else {
      nutrient = await this.nutrientRepository.findOne({
        where: { id, status: 'опубликован' },
      });
    }

    if (!nutrient) {
      throw new NotFoundException('Нутриент не найден');
    }
    return this.toResponseDto(nutrient);
  }

  // GET /api/nutrients/draft — черновик текущего пользователя (не более 1)
  async findDraft(): Promise<NutrientResponseDto | null> {
    const draft = await this.nutrientRepository.findOne({
      where: { status: 'черновик', creatorId: getCurrentCreatorId() },
    });
    return draft ? this.toResponseDto(draft) : null;
  }

  // GET /api/nutrients/:id
  async findOne(id: number): Promise<NutrientResponseDto> {
    const nutrient = await this.nutrientRepository.findOne({
      where: { id, status: Not('удален') },
    });
    if (!nutrient) {
      throw new NotFoundException(`Нутриент с ID ${id} не найден`);
    }
    return this.toResponseDto(nutrient);
  }

  // POST /api/nutrients — создание черновика + загрузка файлов
  async createDraft(
    dto: CreateNutrientDto,
    files: { image?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ): Promise<NutrientResponseDto> {
    const existingDraft = await this.nutrientRepository.findOne({
      where: { status: 'черновик', creatorId: getCurrentCreatorId() },
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

    const nutrient = this.nutrientRepository.create({
      ...dto,
      status: 'черновик',
      creatorId: getCurrentCreatorId(),
      imageKey,
      videoKey,
    });
    const saved = await this.nutrientRepository.save(nutrient);
    return this.toResponseDto(saved);
  }

  // PUT /api/nutrients/:id/publish
  async publish(id: number, dto: PublishNutrientDto): Promise<NutrientResponseDto> {
    const nutrient = await this.nutrientRepository.findOne({
      where: { id, status: 'черновик', creatorId: getCurrentCreatorId() },
    });
    if (!nutrient) {
      throw new NotFoundException('Черновик не найден');
    }

    nutrient.dailyNorm = dto.dailyNorm;
    nutrient.unit = dto.unit;

    if (dto.description !== undefined) {
      nutrient.description = dto.description;
    }

    nutrient.status = 'опубликован';
    nutrient.formedAt = new Date();

    const saved = await this.nutrientRepository.save(nutrient);
    return this.toResponseDto(saved);
  }

  // DELETE /api/nutrients/:id — soft delete через ORM
  async softDelete(id: number): Promise<void> {
    const result = await this.nutrientRepository.update(
      { id, status: Not('удален') },
      { status: 'удален' },
    );

    if (result.affected === 0) {
      throw new NotFoundException(`Нутриент с ID ${id} не найден или уже удален`);
    }
  }

  // POST /api/nutrients/:id/like — value=1 поставить, value=0 убрать
  async toggleLike(nutrientId: number, value: number): Promise<void> {
    const nutrient = await this.nutrientRepository.findOne({
      where: { id: nutrientId, status: 'опубликован' },
    });
    if (!nutrient) {
      throw new NotFoundException('Нутриент не найден');
    }

    const userId = getCurrentCreatorId();

    if (value === 1) {
      const existingLike = await this.likeRepository.findOne({
        where: { userId, nutrientId },
      });
      if (!existingLike) {
        const like = this.likeRepository.create({ userId, nutrientId });
        await this.likeRepository.save(like);
      }
    } else if (value === 0) {
      await this.likeRepository.delete({ userId, nutrientId });
    } else {
      throw new BadRequestException('Значение лайка должно быть 0 или 1');
    }
  }

  // Преобразование entity → DTO
  private async toResponseDto(nutrient: Nutrient): Promise<NutrientResponseDto> {
    const imageUrl = await this.minioService.getSignedUrl(nutrient.imageKey);
    const videoUrl = await this.minioService.getSignedUrl(nutrient.videoKey);

    const likesCount = await this.likeRepository.count({
      where: { nutrientId: nutrient.id },
    });

    const existingLike = await this.likeRepository.findOne({
      where: {
        userId: getCurrentCreatorId(),
        nutrientId: nutrient.id,
      },
    });
    const isLiked: 0 | 1 = existingLike ? 1 : 0;

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