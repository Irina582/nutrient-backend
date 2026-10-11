import { IsString, IsOptional, IsNumber, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class NutrientsPublishDto {
  @ApiProperty({ example: 'Описание нутриента', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 90 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  dailyNorm: number;

  @ApiProperty({ example: 'г' })
  @IsString()
  @IsNotEmpty()
  unit: string;
}