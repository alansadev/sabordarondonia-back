import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { UserRoleEnum } from 'src/users/entities/user.role.enum';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (!adminEmail || !adminPassword) {
      console.error(
        'ADMIN_EMAIL ou ADMIN_PASSWORD não definidos nas variáveis de ambiente. Pulando o seed do admin.',
      );
      return;
    }

    const adminExists = await this.usersService.findByEmail(adminEmail);

    if (adminExists) {
      console.log('Usuário administrador já existe. Nenhuma ação necessária.');
      return;
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    await this.usersService.create({
      name: 'Admin',
      email: adminEmail,
      phone: '00000000000',
      password_hash: passwordHash,
      roles: [UserRoleEnum.ADMIN, UserRoleEnum.CLIENT],
    });

    console.log('✅ Usuário administrador criado com sucesso!');
  }
}
