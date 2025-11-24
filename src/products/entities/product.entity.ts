import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { OrderItem } from 'src/orders/entities/order-item.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column({ unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl?: string;

  @Column({ type: 'integer' })
  price!: number;

  @Column({ type: 'integer', default: 0 })
  stock!: number;

  @Column({ nullable: true })
  category?: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  order_items!: OrderItem[];
}
