import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  ValidationPipe,
  UsePipes,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { ClientLoginDto } from './dto/client-login.dto';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtRefreshGuard } from 'src/auth/guards/jwt-refresh.guard';
import { UserPayload } from 'src/auth/interfaces/user-payload.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Login de staff/admin',
    description: 'Autentica funcionários, administradores e vendedores',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        message: 'Login realizado com sucesso',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiUnauthorizedResponse({ description: 'Credenciais inválidas' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const { access_token, refresh_token } = await this.authService.login(
      user,
      'STAFF',
    );

    const isSecure = this.configService.get<string>('COOKIE_SECURE') === 'true';

    const sameSiteValue =
      this.configService.get<string>('COOKIE_SAME_SITE') || 'lax';

    const cookieOptions = {
      httpOnly: true,
      secure: isSecure, // Controlado pelo .env
      sameSite: sameSiteValue as 'lax' | 'none' | 'strict',
      path: '/',
    };

    res.cookie('access_token', access_token, {
      ...cookieOptions,
      maxAge: 8 * 60 * 60 * 1000,
    });

    res.cookie('refresh_token', refresh_token, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      access_token,
      refresh_token,
      message: 'Login realizado com sucesso',
    };
  }

  @Public()
  @Post('client-login')
  @UsePipes(new ValidationPipe())
  @ApiOperation({
    summary: 'Login de cliente',
    description: 'Autentica clientes usando nome e telefone',
  })
  @ApiBody({ type: ClientLoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        message: 'Login realizado com sucesso',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiUnauthorizedResponse({ description: 'Cliente não encontrado' })
  async clientLogin(
    @Body() clientLoginDto: ClientLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateClient(clientLoginDto);
    if (!user) {
      throw new UnauthorizedException(
        'Cliente não encontrado. Verifique os dados ou faça um pedido primeiro.',
      );
    }
    const { access_token } = await this.authService.login(user, 'CLIENT');

    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      maxAge: 8 * 60 * 60 * 1000,
      path: '/',
    };

    res.cookie('access_token', access_token, cookieOptions);

    return {
      access_token,
      message: 'Login realizado com sucesso',
    };
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Request() req: Request & { user: { sub: string; refreshToken: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as { sub: string; refreshToken: string };

    const { access_token, refresh_token } =
      await this.authService.refreshTokens(user.sub, user.refreshToken);

    const isSecure = this.configService.get<string>('COOKIE_SECURE') === 'true';
    const sameSiteValue =
      this.configService.get<string>('COOKIE_SAME_SITE') || 'lax';

    const cookieOptions = {
      httpOnly: true,
      secure: isSecure,
      sameSite: sameSiteValue as 'lax' | 'none' | 'strict',
      path: '/',
    };

    res.cookie('access_token', access_token, {
      ...cookieOptions,
      maxAge: 8 * 60 * 60 * 1000,
    });
    res.cookie('refresh_token', refresh_token, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      access_token,
      refresh_token,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetUser() user: UserPayload) {
    return this.authService.logout(user.userId);
  }
}
