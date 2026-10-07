import { IsString, IsOptional, IsNumber, Min, IsNotEmpty, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class PublishNutrientDto {
  // Описание — необязательное
  @IsOptional()
  @IsString()
  description?: string;

  // Дневная норма — ОБЯЗАТЕЛЬНА при публикации
  @Type(() => Number)
  @IsNumber({}, { message: 'dailyNorm должно быть числом' })
  @Min(0, { message: 'dailyNorm не может быть отрицательным' })
  dailyNorm: number;

  // Единица измерения — ОБЯЗАТЕЛЬНА при публикации
  @IsString()
  @IsNotEmpty({ message: 'unit не может быть пустым' })
  @MinLength(1, { message: 'unit не может быть пустым' })
  unit: string;
}