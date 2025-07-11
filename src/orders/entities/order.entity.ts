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

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int', unique: true })
  @Generated('increment')
  order_number!: number;

  // Relação com o cliente que é o dono do pedido
  @ManyToOne(() => User, { eager: true }) // eager: true para carregar o cliente junto com o pedido
  @JoinColumn({ name: 'client_id' })
  client!: User;

  // NOVO: Relação opcional com o vendedor que criou o pedido
  @ManyToOne(() => User, { nullable: true, eager: true }) // nullable: true, pois nem todo pedido terá um vendedor
  @JoinColumn({ name: 'seller_id' })
  seller?: User;

  // AJUSTE: Relação opcional com o caixa que confirmou o pagamento
  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'cashier_id' })
  cashier?: User;

  @ManyToOne(() => User, { nullable: true, eager: true })
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

  @Column({ type: 'integer' })
  total_amount!: number; // Total em centavos

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
