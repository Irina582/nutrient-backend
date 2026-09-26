import { IsString, IsOptional, IsNumber, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateNutrientDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  dailyNorm?: number;

  @IsOptional()
  @IsString()
  unit?: string;
}