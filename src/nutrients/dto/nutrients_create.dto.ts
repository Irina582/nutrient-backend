import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NutrientsCreateDto {
  @ApiProperty({ example: 'Белок' })
  @IsString()
  @MinLength(3, { message: 'Название должно быть не менее 3 символов' })
  name: string;
}