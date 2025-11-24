import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { UserRoleEnum } from '../entities/user.role.enum';
import { UpdateUserDto } from './update-user.dto';

export class UpdateUserInternalDto extends UpdateUserDto {
  @ApiProperty({
    description: 'Atualizar roles do usuário (Apenas Admin)',
    enum: UserRoleEnum,
    isArray: true,
    required: false,
    example: [UserRoleEnum.ADMIN, UserRoleEnum.SELLER],
  })
  @IsEnum(UserRoleEnum, { each: true })
  @IsArray()
  @IsOptional()
  roles?: UserRoleEnum[];
}
