import { UserRoleEnum } from 'src/users/entities/user.role.enum';

export class ValidatedUserDto {
  id!: string;
  name!: string;
  email?: string;
  roles!: UserRoleEnum[];
}
