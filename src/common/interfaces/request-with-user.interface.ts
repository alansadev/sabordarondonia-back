import { Request } from 'express';
import { UserRoleEnum } from 'src/users/entities/user.role.enum';

interface UserPayload {
  roles: UserRoleEnum[];
}

export interface RequestWithUser extends Request {
  user: UserPayload;
}
