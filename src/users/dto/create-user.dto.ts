import { UserRoleEnum } from '../entities/user.role';
import {
  IsArray,
  IsBoolean,
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
  @MinLength(12)
  @MaxLength(12)
  phone!: string;

  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;

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
