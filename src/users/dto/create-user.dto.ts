import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'Maria Santos',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name!: string;

  @ApiProperty({
    description: 'Telefone do usuário com DDD, sem formatação',
    example: '69912345678',
    minLength: 10,
    maxLength: 11,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(11)
  phone!: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'maria.santos@sabordarondonia.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description:
      'Senha do usuário (mínimo 8 caracteres, maiúsculas, minúsculas, números e símbolos)',
    example: 'SenhaSegura123!',
    format: 'password',
  })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 1,
    minNumbers: 1,
  })
  @IsOptional()
  password?: string;
}
