import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { ClientLoginDto } from './dto/client-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return this.authService.login(user);
  }

  @Public()
  @Post('client-login')
  @UsePipes(new ValidationPipe())
  async clientLogin(@Body() clientLoginDto: ClientLoginDto) {
    const user = await this.authService.validateClient(clientLoginDto);
    if (!user) {
      throw new UnauthorizedException(
        'Cliente não encontrado. Verifique os dados ou faça um pedido primeiro.',
      );
    }
    return this.authService.login(user);
  }
}
