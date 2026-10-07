import { IsString, MinLength } from 'class-validator';

export class CreateNutrientDto {
  @IsString()
  @MinLength(3, { message: 'Название должно быть не менее 3 символов' })
  name: string;
}