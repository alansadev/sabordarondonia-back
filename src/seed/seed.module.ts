import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { UsersModule } from 'src/users/users.module';
import { ProductsModule } from 'src/products/products.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UsersModule, ProductsModule, ConfigModule],
  providers: [SeedService],
})
export class SeedModule {}
