import { Order } from 'src/orders/entities/order.entity';
import { UserRole } from './user.role';
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  roles: UserRole[];

  @Column()
  name: string;

  @Column({ unique: true })
  phone: string;

  @Column()
  is_admin: boolean;

  @Column()
  password_hash?: string;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @CreateDateColumn()
  created_at?: Date;

  @UpdateDateColumn()
  updated_at?: Date;
}
