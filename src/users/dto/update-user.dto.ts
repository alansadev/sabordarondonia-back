import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'Maria Santos Silva',
    required: false,
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Telefone do usuário com DDD, sem formatação',
    example: '69912345678',
    required: false,
    minLength: 10,
    maxLength: 11,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(11)
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description:
      'Nova senha do usuário (mínimo 8 caracteres, com maiúsculas, minúsculas, números e símbolos)',
    example: 'NovaSenhaSegura123!',
    format: 'password',
    required: false,
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
