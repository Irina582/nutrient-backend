import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'nutrientuser' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'nutrient123' })
  @IsString()
  @MinLength(3, { message: 'Название должно быть не менее 3 символов' })
  password: string;
}