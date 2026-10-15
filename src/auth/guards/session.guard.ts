import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionService } from '../../session/session.service';
import { NutrientsUserService } from '../../nutrients_user/nutrients_user.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private sessionService: SessionService,
    private nutrientsUserService: NutrientsUserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const sessionId = req.cookies?.sessionId;

    if (!sessionId) {
      throw new UnauthorizedException();
    }

    const userId = await this.sessionService.getUserId(sessionId);
    if (!userId) {
      throw new UnauthorizedException();
    }

    const user = await this.nutrientsUserService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    req.session = { userId: user.id };
    req.user = user;
    return true;
  }
}