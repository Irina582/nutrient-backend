import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'nutrientuser' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'nutrient123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}