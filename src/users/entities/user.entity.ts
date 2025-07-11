import { Order } from 'src/orders/entities/order.entity';
import { UserRoleEnum } from './user.role.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: UserRoleEnum,
    array: true,
    default: [UserRoleEnum.CLIENT],
  })
  roles!: UserRoleEnum[];

  @Column()
  name!: string;

  @Column({ unique: true })
  phone!: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Exclude()
  @Column({ nullable: true })
  password_hash?: string;

  @OneToMany(() => Order, (order) => order.client)
  orders_as_client!: Order[];

  @OneToMany(() => Order, (order) => order.seller)
  orders_as_seller!: Order[];

  @OneToMany(() => Order, (order) => order.cashier)
  orders_as_cashier!: Order[];

  @OneToMany(() => Order, (order) => order.dispatcher)
  orders_as_dispatcher!: Order[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
