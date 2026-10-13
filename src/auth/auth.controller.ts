import { Body, Controller, Post, Res, Req } from '@nestjs/common';
import express from 'express';
import { ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя (создателя)' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.username, dto.password);
  }

  @Post('login')
  @ApiOperation({ summary: 'Аутентификация пользователя (создание сессии)' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { sessionId, user } = await this.authService.login(dto.username, dto.password);
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
    });
    return { user };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Выход из аккаунта (удаление сессии)' })
  async logout(@Req() req: express.Request, @Res() res: express.Response) {
    const sessionId = req.cookies.sessionId;
    if (sessionId) {
      await this.authService.logout(sessionId);
    }
    res.clearCookie('sessionId');
    return res.status(200).json({ ok: true });
  }
}