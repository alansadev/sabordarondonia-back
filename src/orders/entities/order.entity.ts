import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Order {
  @ObjectIdColumn()
  _id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user' })
  user: User;

  @Column()
  paymentMethod: string;

  @Column('int64')
  value: number;

  @Column()
  clientName?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
