import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { UsersService } from 'src/users/users.service';
import { OrderItem } from './entities/order-item.entity';
import { ProductsService } from 'src/products/products.service';
import { AddProductDto } from './dto/add-product.dto';
import { ObjectId } from 'mongodb';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
  ) {}
  async create(createOrderDto: CreateOrderDto): Promise<User> {
    const user = await this.usersService.findOne(createOrderDto.userId);

    const newOrder = this.orderRepository.create({
      user: user,
      paymentMethod: createOrderDto.paymentMethod,
      items: [],
      totalValue: 0,
    });

    await this.orderRepository.save(newOrder);

    return this.usersService.findOne(createOrderDto.userId);
  }

  async addProductToOrder(
    orderId: string,
    addProductDto: AddProductDto,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { _id: new ObjectId(orderId) },
    });
    if (!order) {
      throw new NotFoundException(`Pedido com ID ${orderId} não encontrado.`);
    }

    const product = await this.productsService.findOne(addProductDto.productId);
    if (!product) {
      throw new NotFoundException(
        `Produto com ID ${addProductDto.productId} não encontrado.`,
      );
    }

    const newOrderItem = this.orderItemRepository.create({
      order: order,
      product: product,
      quantity: addProductDto.quantity,
      priceAtTimeOfPurchase: product.price,
    });

    await this.orderItemRepository.save(newOrderItem);

    // Recalcular o valor total do pedido
    const updatedOrder = (await this.orderRepository.findOne({
      where: { _id: new ObjectId(orderId) },
      relations: ['items', 'items.product'],
    })) as Order;

    updatedOrder.totalValue = updatedOrder.items.reduce((total, item) => {
      return total + item.priceAtTimeOfPurchase * item.quantity;
    }, 0);

    await this.orderRepository.save(updatedOrder);

    return updatedOrder;
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find();
  }

  async findOne(id: string): Promise<Order> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Formato de ID de pedido inválido: ${id}`);
    }
    const order = await this.orderRepository.findOne({
      where: { _id: new ObjectId(id) },
      relations: ['user', 'items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }
    return order;
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: string) {
    return `This action removes a #${id} order`;
  }
}
