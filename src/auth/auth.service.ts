import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { ValidatedUserDto } from './dto/validated-user.dto';
import { UserRoleEnum } from 'src/users/entities/user.role.enum';
import { ClientLoginDto } from 'src/auth/dto/client-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(user: ValidatedUserDto, loginContext: 'STAFF' | 'CLIENT') {
    let rolesForToken: UserRoleEnum[];

    if (loginContext === UserRoleEnum.CLIENT) {
      rolesForToken = [UserRoleEnum.CLIENT];
    } else {
      rolesForToken = user.roles.filter((role) => role !== UserRoleEnum.CLIENT);
    }

    if (
      user.roles.includes(UserRoleEnum.SELLER) &&
      !rolesForToken.includes(UserRoleEnum.SELLER)
    ) {
      if (loginContext === 'STAFF') rolesForToken.push(UserRoleEnum.SELLER);
    }

    if (!rolesForToken.length)
      throw new UnauthorizedException(
        'O utilizador não tem permissões para aceder a esta área.',
      );

    const tokens = await this.getTokens(user.id, user.name, rolesForToken);

    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.current_refresh_token)
      throw new ForbiddenException('Acesso Negado');

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.current_refresh_token,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Acesso Negado');

    const roles = user.roles;

    const tokens = await this.getTokens(user.id, user.name, roles);

    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

    return tokens;
  }

  private async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(userId, hash);
  }

  private async getTokens(userId: string, name: string, roles: UserRoleEnum[]) {
    const payload = {
      sub: userId,
      name: name,
      roles: roles,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET')!,
        expiresIn: (this.configService.get<string>('JWT_EXPIRATION') ||
          '15m') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')!,
        expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRATION') ||
          '7d') as any,
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async validateClient(
    clientLoginDto: ClientLoginDto,
  ): Promise<ValidatedUserDto | null> {
    const { phone } = clientLoginDto;

    const user = await this.usersService.findByPhone(phone);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    };
  }

  async validateUser(
    email: string,
    pass: string,
  ): Promise<ValidatedUserDto | null> {
    const user = await this.usersService.findForAuth(email);

    if (!user) {
      return null;
    }

    if (user.password_hash) {
      const isMatch = await bcrypt.compare(pass, user.password_hash);

      if (isMatch) {
        const { password_hash, ...result } = user;
        return result as ValidatedUserDto;
      }
    }
    return null;
  }
}
