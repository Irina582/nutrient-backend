export class NutrientsResponseDto {
  id: number;
  name: string;
  description: string | null;
  dailyNorm: number;
  unit: string;
  imageKey: string;
  videoKey: string;
  likesCount: number;
  isLiked: 0 | 1;
  isCreator: 0 | 1;
  createdAt: Date;
  formedAt: Date | null;
  creatorId: number;
}