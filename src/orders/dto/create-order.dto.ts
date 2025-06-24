import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { OrderPaymentMethodEnum } from '../entities/order.payment.method';

export class CreateOrderDto {
  @IsMongoId({ message: 'O ID do usuário deve ser um MongoID válido.' })
  @IsNotEmpty()
  readonly userId!: string;

  @IsEnum(OrderPaymentMethodEnum)
  @IsNotEmpty()
  readonly paymentMethod!: OrderPaymentMethodEnum;

  @IsNumber()
  @Min(0)
  readonly value!: number;

  @IsString()
  @IsOptional()
  readonly clientName?: string;
}
