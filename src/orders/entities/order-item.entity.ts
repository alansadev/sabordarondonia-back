import { Product } from 'src/products/entities/product.entity';
import { Entity, Column, ObjectIdColumn, ObjectId, ManyToOne } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @ObjectIdColumn()
  _id!: ObjectId;

  // Muitos itens pertencem a um Pedido
  @ManyToOne(() => Order, (order) => order.items)
  order!: Order;

  // Muitos itens se referem a um Produto
  @ManyToOne(() => Product, (product) => product.orderItems)
  product!: Product;

  @Column('int')
  quantity!: number;

  @Column('int', { nullable: true })
  priceAtTimeOfPurchase!: number;
}
