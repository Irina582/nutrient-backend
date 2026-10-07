export class NutrientResponseDto {
  id: number;
  name: string;
  description: string | null;
  dailyNorm: number | null;
  unit: string | null;
  imageKey: string;
  videoKey: string;
  likesCount: number;
  isLiked: 0 | 1;    
  createdAt: Date;
  formedAt: Date | null;
  creatorId: number;
}