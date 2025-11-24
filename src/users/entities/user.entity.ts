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
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('users')
export class User extends BaseEntity {
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

  @Column({ type: 'varchar', nullable: true, select: false })
  current_refresh_token?: string | null;
}
