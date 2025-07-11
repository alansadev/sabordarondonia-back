import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ValidatedUserDto } from './dto/validated-user.dto';
import { ClientLoginDto } from './dto/client-login.dto';

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

  async login(user: ValidatedUserDto) {
    const payload = {
      sub: user.id,
      roles: user.roles,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
