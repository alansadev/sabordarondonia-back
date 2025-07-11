import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRoleEnum } from 'src/users/entities/user.role.enum';
import { Public } from 'src/auth/decorators/public.decorator';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Rota para criar um novo produto.
   * Apenas para usuários com o papel de ADMIN.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiBody({
    type: CreateProductDto,
    description: 'Estrutura de dados para a criação de um novo produto.',
    examples: {
      produtoCompleto: {
        summary: 'Exemplo com todos os campos',
        value: {
          name: 'Tênis de Corrida',
          description: 'Ideal para maratonas.',
          price: 49990, // Representa R$ 499,90
          stock: 150,
        } as CreateProductDto,
      },
      produtoMinimo: {
        summary: 'Exemplo com campos obrigatórios',
        value: {
          name: 'Garrafa de Água',
          price: 2500, // Representa R$ 25,00
        } as CreateProductDto,
      },
    },
  })
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  /**
   * Rota pública para listar todos os produtos.
   * Qualquer pessoa (clientes, visitantes) pode ver os produtos.
   */
  @Public()
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  /**
   * Rota pública para buscar um produto específico pelo ID.
   */
  @Public()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  /**
   * Rota para atualizar um produto.
   * Apenas para usuários com o papel de ADMIN.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth('access-token')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  /**
   * Rota para remover um produto.
   * Apenas para usuários com o papel de ADMIN.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth('access-token')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
