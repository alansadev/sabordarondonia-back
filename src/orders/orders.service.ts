import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UserPayload } from 'src/auth/decorators/get-user.decorator';
import { UserRoleEnum } from 'src/users/entities/user.role.enum';
import { ProductsService } from 'src/products/products.service';
import { OrderItem } from './entities/order-item.entity';
import { User } from 'src/users/entities/user.entity';
import { OrderStatusEnum } from './entities/order-status.enum';
import { UsersService } from '../users/users.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly userService: UsersService,
    private readonly productsService: ProductsService,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    user: UserPayload,
  ): Promise<Order> {
    const { items, clientInfo } = createOrderDto;
    let clientForOrder: User;
    let sellerForOrder: User | undefined = undefined;

    if (user.roles.includes(UserRoleEnum.SELLER) && clientInfo) {
      sellerForOrder = await this.userService.findOne(user.userId);

      clientForOrder = await this.userService.findOrCreateByPhone(clientInfo);
    } else {
      clientForOrder = await this.userService.findOne(user.userId);
    }
    const productIds = items.map((item) => item.productId);
    const products = await this.productsService.findByIds(productIds);

    if (products.length !== productIds.length) {
      throw new NotFoundException('Um ou mais produtos não foram encontrados.');
    }

    let totalAmount = 0;
    const orderItems = items.map((itemDto) => {
      const product = products.find((p) => p.id === itemDto.productId);
      if (!product) {
        throw new NotFoundException(
          `Produto com ID ${itemDto.productId} não encontrado.`,
        );
      }
      if (product.stock < itemDto.quantity) {
        throw new BadRequestException(
          `Estoque insuficiente para o produto: ${product.name}`,
        );
      }
      totalAmount += product.price * itemDto.quantity;

      const orderItem = new OrderItem();
      orderItem.product = product;
      orderItem.quantity = itemDto.quantity;
      orderItem.price_at_purchase = product.price;
      return orderItem;
    });

    const newOrder = this.orderRepository.create({
      client: clientForOrder,
      seller: sellerForOrder,
      items: orderItems,
      total_amount: totalAmount,
    });

    return this.orderRepository.save(newOrder);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: [
        'client',
        'seller',
        'cashier',
        'dispatcher',
        'items',
        'items.product',
      ],
    });
  }

  async findOne(id: string, userPayload: UserPayload): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['client', 'items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }

    if (
      userPayload.roles.includes('client') &&
      order.client.id !== userPayload.userId
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para ver este pedido.',
      );
    }

    return order;
  }

  async findOrdersByClientId(clientId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { client: { id: clientId } },
      relations: ['items', 'items.product'],
      order: { created_at: 'DESC' },
    });
  }

  async confirmPayment(id: string, cashierId: string): Promise<Order> {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }

    if (order.status !== OrderStatusEnum.AWAITING_PAYMENT) {
      throw new BadRequestException(
        `Este pedido não está aguardando pagamento.`,
      );
    }

    const cashier = await this.userService.findOne(cashierId);
    order.cashier = cashier;
    order.status = OrderStatusEnum.AWAITING_DISPATCH;

    return this.orderRepository.save(order);
  }

  async dispatchOrder(id: string, dispatcherId: string): Promise<Order> {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }

    if (order.status !== OrderStatusEnum.AWAITING_DISPATCH) {
      throw new BadRequestException(`Este pedido não está aguardando entrega.`);
    }

    const dispatcher = await this.userService.findOne(dispatcherId);
    order.dispatcher = dispatcher;
    order.status = OrderStatusEnum.DELIVERED;

    return this.orderRepository.save(order);
  }

  async remove(id: string): Promise<Order> {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }

    order.status = OrderStatusEnum.CANCELLED;
    return this.orderRepository.save(order);
  }
}
