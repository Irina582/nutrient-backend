import { Controller, Get, Req, Res } from '@nestjs/common';
import express from 'express';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @Get('/login')
  @ApiExcludeEndpoint()
  getLogin(@Req() req: express.Request, @Res() res: express.Response) {
    return res.render('nutrients_login');
  }

  @Get('/profile')
  @ApiExcludeEndpoint()
  async getProfile(@Req() req: express.Request, @Res() res: express.Response) {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      return res.redirect('/login');
    }

    try {
      const user = await this.authService.validateSession(sessionId);
      if (!user) {
        return res.redirect('/login');
      }

      return res.render('nutrients_profile', {
        title: 'Profile',
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      });
    } catch (err) {
      return res.redirect('/login');
    }
  }
}