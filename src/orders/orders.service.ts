import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UserPayload } from 'src/auth/decorators/get-user.decorator';
import { UserRoleEnum } from 'src/users/entities/user.role.enum';
import { ProductsService } from 'src/products/products.service';
import { OrderStatusEnum } from './entities/order-status.enum';
import { UsersService } from '../users/users.service';
import { OrderItem } from './entities/order-item.entity';

export interface OrderListResponseDto {
  id: string;
  order_number: number;
  status: string;
  total_amount: number;
  created_at: Date;
  client: { id: string; name: string };
  seller?: { id: string; name: string };
  cashier?: { id: string; name: string };
  dispatcher?: { id: string; name: string };
  items: {
    id: string;
    quantity: number;
    product: { id: string; name: string };
  }[];
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly userService: UsersService,
    private readonly productsService: ProductsService,
    private readonly dataSource: DataSource,
  ) {}

  private mapOrderToResponseDto(order: Order): OrderListResponseDto {
    return {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      total_amount: order.total_amount,
      created_at: order.created_at,
      client: {
        id: order.client.id,
        name: order.client.name,
      },
      seller: order.seller
        ? {
            id: order.seller.id,
            name: order.seller.name,
          }
        : undefined,
      cashier: order.cashier
        ? {
            id: order.cashier.id,
            name: order.cashier.name,
          }
        : undefined,
      dispatcher: order.dispatcher
        ? {
            id: order.dispatcher.id,
            name: order.dispatcher.name,
          }
        : undefined,
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
        },
      })),
    };
  }

  async create(
    createOrderDto: CreateOrderDto,
    user: UserPayload,
  ): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { items, payment_method, change_for, clientInfo } = createOrderDto;
      const sellerForOrder =
        user.roles.includes(UserRoleEnum.SELLER) && clientInfo
          ? await this.userService.findOne(user.userId)
          : undefined;
      const clientForOrder =
        user.roles.includes(UserRoleEnum.SELLER) && clientInfo
          ? await this.userService.findOrCreateByPhone(clientInfo)
          : await this.userService.findOne(user.userId);

      let totalAmount = 0;
      const orderItems: Partial<OrderItem>[] = [];

      for (const itemDto of items) {
        const product = await this.productsService.updateStock(
          itemDto.productId,
          -itemDto.quantity,
        );

        totalAmount += product.price * itemDto.quantity;
        orderItems.push({
          product: product,
          quantity: itemDto.quantity,
          price_at_purchase: product.price,
        });
      }

      const orderToCreate = {
        client: clientForOrder,
        seller: sellerForOrder,
        items: orderItems,
        total_amount: totalAmount,
        payment_method: payment_method,
        change_for: change_for,
      };

      const newOrder = await queryRunner.manager.save(
        this.orderRepository.create(orderToCreate),
      );

      await queryRunner.commitTransaction();
      return newOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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

  async cancel(id: string): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id },
        relations: ['items', 'items.product'],
      });

      if (!order) {
        throw new NotFoundException(`Pedido com ID ${id} não encontrado.`);
      }

      const cancellableStatuses = [
        OrderStatusEnum.AWAITING_PAYMENT,
        OrderStatusEnum.AWAITING_DISPATCH,
      ];

      if (!cancellableStatuses.includes(order.status)) {
        throw new BadRequestException(
          `Pedidos com status '${order.status}' não podem ser cancelados.`,
        );
      }

      for (const item of order.items) {
        await this.productsService.updateStock(item.product.id, item.quantity);
      }

      order.status = OrderStatusEnum.CANCELLED;
      const cancelledOrder = await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();
      return cancelledOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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

  async findOrdersByClientId(
    clientId: string,
  ): Promise<OrderListResponseDto[]> {
    const orders = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoinAndSelect('order.client', 'client_user')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('order.seller', 'seller_user')
      .where('client_user.id = :clientId', { clientId })
      .orderBy('order.created_at', 'DESC')
      .getMany();
    return orders.map((order) => this.mapOrderToResponseDto(order));
  }

  async findOrdersBySellerId(
    sellerId: string,
  ): Promise<OrderListResponseDto[]> {
    const orders = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoinAndSelect('order.seller', 'seller')
      .leftJoinAndSelect('order.client', 'client')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('seller.id = :sellerId', { sellerId })
      .orderBy('order.created_at', 'DESC')
      .getMany();

    return orders.map((order) => this.mapOrderToResponseDto(order));
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
