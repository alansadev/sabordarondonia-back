import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy'; // <--- Importe isso
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule, // <--- Importação direta (Auth precisa de Users para validar senha)
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        return {
          secret: secret,
          signOptions: { expiresIn: '15m' }, // Access Token dura pouco (15m)
        };
      },
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy, // <--- Adicionado: Necessário para o Refresh funcionar
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule], // <--- Importante exportar
})
export class AuthModule {}
