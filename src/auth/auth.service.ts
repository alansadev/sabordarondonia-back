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

  /**
   * Valida um utilizador interno (com palavra-passe).
   */
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

  /**
   * Valida um cliente final pelo telefone.
   * Se o cliente não existir, ele será criado com o papel de CLIENT.
   * Este método agora chama o findOrCreateByPhone do UsersService.
   */
  async validateClient(
    clientLoginDto: ClientLoginDto,
  ): Promise<ValidatedUserDto> {
    // A lógica de "encontrar ou criar" agora é chamada aqui.
    const user = await this.usersService.findOrCreateByPhone(clientLoginDto);

    // Formata o retorno para o padrão do nosso DTO de validação
    const result: ValidatedUserDto = {
      id: user.id,
      name: user.name,
      email: user.email, // Pode ser nulo, mas o tipo permite
      roles: user.roles,
    };
    return result;
  }

  /**
   * Gera um token JWT para um utilizador validado.
   */
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
