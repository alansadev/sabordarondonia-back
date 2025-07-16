import { Request } from 'express';
import { UserRoleEnum } from 'src/users/entities/user.role.enum';

// Esta interface descreve o payload do usuário que vem do seu guard de autenticação
interface UserPayload {
  // você pode adicionar outras propriedades do usuário aqui, como id, email, etc.
  roles: UserRoleEnum[];
}

export interface RequestWithUser extends Request {
  user: UserPayload;
}
