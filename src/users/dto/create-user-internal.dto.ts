import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { UserRoleEnum } from '../entities/user.role.enum';
import { CreateUserDto } from './create-user.dto';

export class CreateUserInternalDto extends CreateUserDto {
  @ApiProperty({
    description: 'Roles do usuário (Apenas Admins)',
    enum: UserRoleEnum,
    isArray: true,
    example: [UserRoleEnum.ADMIN, UserRoleEnum.SELLER],
    required: false,
  })
  @IsEnum(UserRoleEnum, { each: true })
  @IsArray()
  @IsOptional()
  roles?: UserRoleEnum[];
}
