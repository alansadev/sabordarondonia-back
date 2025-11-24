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
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { UserRoleEnum } from 'src/users/entities/user.role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { GetUser, UserPayload } from 'src/auth/decorators/get-user.decorator';
import { OrderStatusEnum } from './entities/order-status.enum';
import { OrdersEventsService } from './orders-events.service';
import { Response } from 'express';
import { Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(RolesGuard)
@ApiBearerAuth('access-token')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly ordersEvents: OrdersEventsService,
  ) {}

  @Post()
  @Roles(UserRoleEnum.CLIENT, UserRoleEnum.SELLER)
  @ApiOperation({
    summary: 'Criar pedido',
    description: 'Cria um novo pedido com itens e informações do cliente',
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Pedido criado com sucesso',
    schema: {
      example: {
        id: 'a4f49278-64e7-46eb-889b-d5ab835046eb',
        order_number: 1,
        status: 'AWAITING_PAYMENT',
        total_amount: 599999,
        created_at: '2025-11-21T22:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou produto não encontrado',
  })
  @ApiForbiddenResponse({ description: 'Acesso negado' })
  create(@Body() createOrderDto: CreateOrderDto, @GetUser() user: UserPayload) {
    return this.ordersService.create(createOrderDto, user);
  }

  @Roles(UserRoleEnum.CLIENT, UserRoleEnum.SELLER, UserRoleEnum.ADMIN)
  @Get('my-orders')
  @ApiOperation({
    summary: 'Listar meus pedidos',
    description: 'Retorna todos os pedidos do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pedidos do usuário',
  })
  findMyOrders(@GetUser() client: UserPayload) {
    return this.ordersService.findOrdersByClientId(client.userId ?? client.sub);
  }

  @Roles(UserRoleEnum.SELLER, UserRoleEnum.ADMIN)
  @Get('my-sales')
  @ApiOperation({
    summary: 'Listar minhas vendas',
    description: 'Retorna todos os pedidos vendidos pelo vendedor autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de vendas do vendedor',
  })
  findMySales(@GetUser() seller: UserPayload) {
    return this.ordersService.findOrdersBySellerId(seller.userId ?? seller.sub);
  }

  @Roles(
    UserRoleEnum.ADMIN,
    UserRoleEnum.CASHIER,
    UserRoleEnum.DISPATCHER,
    UserRoleEnum.SELLER,
  )
  @Get()
  @ApiOperation({
    summary: 'Listar todos os pedidos',
    description: 'Retorna todos os pedidos (requer permissões adequadas)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos os pedidos',
  })
  findAll(@Query('status') status?: OrderStatusEnum) {
    return this.ordersService.findAll(status);
  }

  @Get('sse/cashier')
  @Roles(UserRoleEnum.CASHIER, UserRoleEnum.ADMIN)
  @ApiOperation({
    summary: 'Stream SSE para caixa',
    description: 'Envia eventos de novos pedidos para o caixa',
  })
  @ApiResponse({ status: 200, description: 'Conexão SSE estabelecida' })
  cashierStream(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Evento inicial opcional
    res.write(
      `data: ${JSON.stringify({ type: 'CONNECTED', role: 'CASHIER' })}\n\n`,
    );

    this.ordersEvents.addCashierClient(res);
  }

  @Get('sse/dispatcher')
  @Roles(UserRoleEnum.DISPATCHER, UserRoleEnum.ADMIN)
  @ApiOperation({
    summary: 'Stream SSE para entregador',
    description: 'Envia eventos de pedidos disponíveis para entrega',
  })
  @ApiResponse({ status: 200, description: 'Conexão SSE estabelecida' })
  dispatcherStream(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    res.write(
      `data: ${JSON.stringify({ type: 'CONNECTED', role: 'DISPATCHER' })}\n\n`,
    );

    this.ordersEvents.addDispatcherClient(res);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar pedido por ID',
    description: 'Retorna detalhes de um pedido específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do pedido (UUID)',
    example: 'a4f49278-64e7-46eb-889b-d5ab835046eb',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes do pedido',
  })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: UserPayload,
  ) {
    return this.ordersService.findOne(id, user);
  }

  @Roles(UserRoleEnum.CASHIER, UserRoleEnum.ADMIN)
  @Patch(':id/confirm-payment')
  @ApiOperation({
    summary: 'Confirmar pagamento',
    description: 'Confirma o pagamento de um pedido',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do pedido (UUID)',
    example: 'a4f49278-64e7-46eb-889b-d5ab835046eb',
  })
  @ApiResponse({
    status: 200,
    description: 'Pagamento confirmado com sucesso',
  })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado' })
  @ApiForbiddenResponse({ description: 'Acesso negado' })
  confirmPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: UserPayload,
  ) {
    const cashierId = user.userId;
    return this.ordersService.confirmPayment(id, cashierId);
  }

  @Roles(UserRoleEnum.DISPATCHER, UserRoleEnum.ADMIN)
  @Patch(':id/dispatch')
  @ApiOperation({
    summary: 'Despachar pedido',
    description: 'Marca um pedido como despachado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do pedido (UUID)',
    example: 'a4f49278-64e7-46eb-889b-d5ab835046eb',
  })
  @ApiResponse({
    status: 200,
    description: 'Pedido despachado com sucesso',
  })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado' })
  @ApiForbiddenResponse({ description: 'Acesso negado' })
  dispatchOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: UserPayload,
  ) {
    const dispatcherId = user.userId;
    return this.ordersService.dispatchOrder(id, dispatcherId);
  }

  @Roles(UserRoleEnum.ADMIN)
  @Delete(':id')
  @ApiOperation({
    summary: 'Deletar pedido',
    description: 'Remove um pedido (apenas admin)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do pedido (UUID)',
    example: 'a4f49278-64e7-46eb-889b-d5ab835046eb',
  })
  @ApiResponse({
    status: 200,
    description: 'Pedido deletado com sucesso',
  })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado' })
  @ApiForbiddenResponse({ description: 'Acesso negado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.remove(id);
  }

  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SELLER)
  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Cancelar pedido',
    description: 'Cancela um pedido',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do pedido (UUID)',
    example: 'a4f49278-64e7-46eb-889b-d5ab835046eb',
  })
  @ApiResponse({
    status: 200,
    description: 'Pedido cancelado com sucesso',
  })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado' })
  @ApiForbiddenResponse({ description: 'Acesso negado' })
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.cancel(id);
  }
}
