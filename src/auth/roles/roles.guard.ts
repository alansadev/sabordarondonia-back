import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoleEnum } from 'src/users/entities/user.role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true; // Se não há papéis definidos na rota, permite o acesso
    }
    const { user } = context.switchToHttp().getRequest();

    // Verifica se o array de papéis do usuário inclui pelo menos um dos papéis requeridos
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
