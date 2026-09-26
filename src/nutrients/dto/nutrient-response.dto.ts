export class NutrientResponseDto {
  id: number;
  name: string;
  description: string | null;
  dailyNorm: number | null;
  unit: string | null;
  imageKey: string;
  videoKey: string;
  likesCount: number;
  createdAt: Date;
  formedAt: Date | null;
  creatorId: number;
}