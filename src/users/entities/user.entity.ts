import { Order } from 'src/orders/entities/order.entity';
import { UserRoleEnum } from './user.role';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ObjectId,
  ObjectIdColumn,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column()
  roles!: UserRoleEnum[];

  @Column()
  name!: string;

  @Column({ unique: true })
  phone!: string;

  @Column()
  is_admin!: boolean;

  @Column({ nullable: true })
  password_hash?: string;

  @OneToMany(() => Order, (order) => order.user, { eager: true })
  orders!: Order[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
