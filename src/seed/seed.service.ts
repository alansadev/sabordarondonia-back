import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service'; // Importe se faltar
import { ConfigService } from '@nestjs/config';
import { UserRoleEnum } from '../users/entities/user.role.enum';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly productsService: ProductsService,
  ) {}

  async onModuleInit() {
    console.log('🌱 [SEED] Iniciando processo de seed...');
    try {
      await this.seedAdminUser();
      await this.seedProducts();
      console.log('✅ [SEED] Concluído com sucesso!');
    } catch (error) {
      // AQUI ESTÁ O SEGREDO: Capturamos o erro para ver o que é,
      // mas NÃO deixamos ele matar a aplicação.
      console.error('❌ [SEED] ERRO FATAL DURANTE O SEED:', error);
    }
  }

  private async seedAdminUser() {
    console.log('👤 [SEED] Verificando Admin...');
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (!adminEmail || !adminPassword) {
      console.warn('⚠️ [SEED] Variáveis de ADMIN não definidas. Pulando.');
      return;
    }

    const adminExists = await this.usersService.findByEmail(adminEmail);
    if (adminExists) {
      console.log('ℹ️ [SEED] Admin já existe.');
      return;
    }

    await this.usersService.create({
      name: 'Administrador',
      email: adminEmail,
      phone: '99999999999',
      password: adminPassword,
      roles: [UserRoleEnum.ADMIN, UserRoleEnum.CLIENT],
    });
    console.log('✅ [SEED] Admin criado.');
  }

  private async seedProducts() {
    console.log('🍔 [SEED] Verificando Produtos...');
    try {
      const products = await this.productsService.findAll();
      if (products.length > 0) {
        console.log('ℹ️ [SEED] Produtos já existem.');
        return;
      }

      const initialProducts = [
        {
          name: 'X-Tudo Rondônia',
          description: 'Completo',
          price: 35.0,
          stock: 100,
          category: 'Lanche',
        },
        {
          name: 'Refrigerante Lata',
          description: 'Gelada',
          price: 6.0,
          stock: 200,
          category: 'Bebida',
        },
      ];

      for (const prod of initialProducts) {
        // Atenção: O create agora espera (dto, file). Passamos undefined no file.
        await this.productsService.create(
          {
            ...prod,
            imageUrl: 'https://placehold.co/400', // Imagem dummy para não quebrar
          },
          undefined,
        );
      }
      console.log('✅ [SEED] Produtos criados.');
    } catch (e) {
      console.error('❌ [SEED] Erro ao criar produtos:', e);
      // Não rethrow, deixa seguir
    }
  }
}
