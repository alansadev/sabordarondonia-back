import { Order } from 'src/orders/entities/order.entity';
import { UserRole } from './user.role';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  roles: UserRole;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column()
  isAdmin: boolean;

  @Column()
  passwordHash?: string;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
