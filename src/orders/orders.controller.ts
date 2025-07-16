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

  @Post()
  @Roles(UserRoleEnum.CLIENT, UserRoleEnum.SELLER)
  create(@Body() createOrderDto: CreateOrderDto, @GetUser() user: UserPayload) {
    // Passamos o payload completo do usuário para o serviço
    return this.ordersService.create(createOrderDto, user);
  }

  @Roles(UserRoleEnum.CLIENT, UserRoleEnum.SELLER)
  @Get('my-orders')
  findMyOrders(@GetUser() client: UserPayload) {
    return this.ordersService.findOrdersByClientId(client.userId ?? client.sub);
  }

  @Roles(UserRoleEnum.SELLER, UserRoleEnum.ADMIN)
  @Get('my-sales')
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
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: UserPayload,
  ) {
    return this.ordersService.findOne(id, user);
  }

  @Roles(UserRoleEnum.CASHIER, UserRoleEnum.ADMIN)
  @Patch(':id/confirm-payment')
  confirmPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: UserPayload,
  ) {
    const cashierId = user.userId;
    return this.ordersService.confirmPayment(id, cashierId);
  }

  @Roles(UserRoleEnum.DISPATCHER, UserRoleEnum.ADMIN)
  @Patch(':id/dispatch')
  dispatchOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: UserPayload,
  ) {
    const dispatcherId = user.userId;
    return this.ordersService.dispatchOrder(id, dispatcherId);
  }

  @Roles(UserRoleEnum.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.remove(id);
  }

  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SELLER)
  @Patch(':id/cancel')
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.cancel(id);
  }
}
