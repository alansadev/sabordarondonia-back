import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { OrderStatusEnum } from './order-status.enum';
import { PaymentMethod } from 'src/orders/entities/payment-method.enum';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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

  @Column({ type: 'enum', enum: PaymentMethod })
  payment_method!: PaymentMethod;

  @Column({ type: 'integer', nullable: true })
  change_for?: number;

  @Column({ type: 'integer' })
  total_amount!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
