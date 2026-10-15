import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { NutrientsUserService } from '../nutrients_user/nutrients_user.service';
import { SessionService } from '../session/session.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private nutrientsUserService: NutrientsUserService,
    private sessionService: SessionService,
  ) {}

  async register(username: string, password: string) {
    const existing = await this.nutrientsUserService.findByUsername(username);
    if (existing) throw new ConflictException();
    
    return this.nutrientsUserService.create({
      username,
      password,
      role: 'создатель',
    });
  }

  async login(username: string, password: string) {
    const user = await this.nutrientsUserService.findByUsername(username);
    if (!user || user.password !== password) {
      throw new UnauthorizedException();
    }

    const sessionId = uuidv4();
    await this.sessionService.create(sessionId, user.id);
    return {
      sessionId,
      user: { id: user.id, username: user.username, role: user.role },
    };
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionService.destroy(sessionId);
  }

  async validateSession(sessionId: string) {
    const userId = await this.sessionService.getUserId(sessionId);
    if (!userId) throw new UnauthorizedException();
    const user = await this.nutrientsUserService.findById(userId);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}