import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IJwtPayload } from '../../auth/types/auth.types';

@Injectable()
export class WsJwtGuard {
  constructor(private readonly jwtService: JwtService) {}

  verify(token: unknown): IJwtPayload {
    if (typeof token !== 'string' || token.trim().length === 0) {
      throw new UnauthorizedException('JWT-токен не передан');
    }

    try {
      return this.jwtService.verify<IJwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Недействительный JWT-токен');
    }
  }
}
