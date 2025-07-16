import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ValidatedUserDto } from './dto/validated-user.dto';
import { ClientLoginDto } from './dto/client-login.dto';
import { UserRoleEnum } from '../users/entities/user.role.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<ValidatedUserDto | null> {
    const user = await this.usersService.findForAuth(email);

    if (!user || !user.password_hash) {
      return null;
    }

    const isPasswordMatching = await bcrypt.compare(pass, user.password_hash);

    if (isPasswordMatching) {
      const result: ValidatedUserDto = {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      };
      return result;
    }
    return null;
  }

  async validateClient(
    clientLoginDto: ClientLoginDto,
  ): Promise<ValidatedUserDto> {
    const user = await this.usersService.findOrCreateByPhone(clientLoginDto);

    const result: ValidatedUserDto = {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    };
    return result;
  }

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

    const payload = {
      sub: user.id,
      name: user.name,
      roles: rolesForToken,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
