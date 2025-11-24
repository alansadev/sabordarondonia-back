import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UserRoleEnum } from 'src/users/entities/user.role.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET não foi definido nas variáveis de ambiente');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 1. Tenta ler do Cookie (Prioridade para o Front Web)
        (request: Request) => {
          const cookies = request.cookies as Record<string, string> | undefined;
          return cookies?.access_token || null;
        },
        // 2. Fallback: Tenta ler do Header 'Authorization: Bearer <token>' (Para Swagger/Postman)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: { sub: string; roles: UserRoleEnum[] }) {
    return { userId: payload.sub, roles: payload.roles };
  }
}
