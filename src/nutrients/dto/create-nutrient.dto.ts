import { IsString, IsOptional, IsNumber, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNutrientDto {
  @IsString()
  @MinLength(3, { message: 'Название должно быть не менее 3 символов' })
  name: string;

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