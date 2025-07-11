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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { UserRoleEnum } from 'src/users/entities/user.role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { GetUser, UserPayload } from 'src/auth/decorators/get-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Cria um novo pedido.
   * Agora requer um token de um usuário com a permissão de CLIENT.
   * O ID do cliente é extraído diretamente do token.
   */
  @Post()
  @Roles(UserRoleEnum.CLIENT, UserRoleEnum.SELLER)
  create(@Body() createOrderDto: CreateOrderDto, @GetUser() user: UserPayload) {
    // Passamos o payload completo do usuário para o serviço
    return this.ordersService.create(createOrderDto, user);
  }
  /**
   * Rota para um CLIENTE logado buscar seus próprios pedidos.
   */
  @Roles(UserRoleEnum.CLIENT)
  @Get('my-orders')
  findMyOrders(@GetUser() client: UserPayload) {
    console.log(client);
    return this.ordersService.findOrdersByClientId(client.userId);
  }

  /**
   * Lista TODOS os pedidos. Apenas para usuários internos logados.
   */
  @Roles(
    UserRoleEnum.ADMIN,
    UserRoleEnum.CASHIER,
    UserRoleEnum.DISPATCHER,
    UserRoleEnum.SELLER,
  )
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  /**
   * Busca um pedido específico pelo seu ID.
   */
  @Get(':id')
  // Apenas requer login. A lógica de quem pode ver o quê está no service.
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: UserPayload,
  ) {
    return this.ordersService.findOne(id, user);
  }

  /**
   * Rota para um caixa confirmar o pagamento de um pedido.
   */
  @Roles(UserRoleEnum.CASHIER, UserRoleEnum.ADMIN)
  @Patch(':id/confirm-payment')
  confirmPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: UserPayload,
  ) {
    const cashierId = user.userId;
    return this.ordersService.confirmPayment(id, cashierId);
  }

  /**
   * Rota para um entregador marcar um pedido como entregue.
   */
  @Roles(UserRoleEnum.DISPATCHER, UserRoleEnum.ADMIN)
  @Patch(':id/dispatch')
  dispatchOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: UserPayload,
  ) {
    const dispatcherId = user.userId;
    return this.ordersService.dispatchOrder(id, dispatcherId);
  }

  /**
   * Deleta/Cancela um pedido. Apenas para administradores.
   */
  @Roles(UserRoleEnum.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.remove(id);
  }
}
