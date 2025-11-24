import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Generated,
} from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatusEnum } from './order-status.enum';
import { PaymentMethod } from './payment-method.enum'; // Crie este enum se não existir

@Entity('orders')
export class Order extends BaseEntity {
  @Column({ type: 'int', unique: true })
  @Generated('increment')
  order_number!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'client_id' })
  client!: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'seller_id' })
  seller?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'cashier_id' })
  cashier?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'dispatcher_id' })
  dispatcher?: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
    eager: true,
  })
  items!: OrderItem[];

  @Column({
    type: 'enum',
    enum: OrderStatusEnum,
    default: OrderStatusEnum.AWAITING_PAYMENT,
  })
  status!: OrderStatusEnum;

  @Column({ type: 'enum', enum: PaymentMethod }) // Ou enum PaymentMethod
  payment_method!: string;

  @Column({ type: 'integer', nullable: true })
  change_for?: number;

  @Column({ type: 'integer' })
  total_amount!: number;
}
