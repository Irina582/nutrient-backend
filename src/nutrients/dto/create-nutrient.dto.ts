export class CreateNutrientDto {
  name: string;
  shortDescription?: string;
  dailyNorm?: number;
  unit?: string;
  category?: string;
  imageUrl?: string;
  videoUrl?: string;
}