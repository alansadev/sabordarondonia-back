import { UserRoleEnum } from '../entities/user.role.enum';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEnum(UserRoleEnum, { each: true })
  @IsArray()
  @IsOptional()
  roles?: UserRoleEnum[];

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name!: string;

  @IsString()
  @IsNotEmpty()
  // Ajustado para aceitar 10 ou 11 dígitos, que é o padrão no Brasil para celulares.
  @MinLength(10)
  @MaxLength(11)
  phone!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 1,
    minNumbers: 1,
  })
  @IsOptional()
  password?: string;

  // Propriedade adicionada para o seeder
  @IsString()
  @IsOptional()
  password_hash?: string;
}
