import { OrderItem } from 'src/orders/entities/order-item.entity';
import { Entity, Column, ObjectIdColumn, ObjectId, OneToMany } from 'typeorm';

@Entity('products')
export class Product {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column('int')
  stock!: number;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems!: OrderItem[];
}
