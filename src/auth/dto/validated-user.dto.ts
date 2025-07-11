import { UserRoleEnum } from 'src/users/entities/user.role.enum';

/**
 * DTO interno para representar um utilizador que passou na validação.
 * Garante que apenas os dados seguros e necessários sejam passados
 * para a função de criação do token JWT.
 */
export class ValidatedUserDto {
  id!: string;
  name!: string;
  email?: string; // O email é opcional, pois um cliente pode não ter
  roles!: UserRoleEnum[];
}
