import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST /api/users/register
  @Post('register')
  async register(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.register(dto);
  }

  // POST /api/users/auth — 200 OK (не 201), потому что ничего не создаём
  @Post('auth')
  @HttpCode(HttpStatus.OK)
  async auth(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.auth(dto);
  }

  // POST /api/users/deauth — 204 No Content
  @Post('deauth')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deauth(): Promise<void> {
    return this.usersService.deauth();
  }
}