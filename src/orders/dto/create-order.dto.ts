import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from 'src/orders/entities/payment-method.enum';

class ClientInfoDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(11)
  phone!: string;
}

class OrderItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;
}

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => ClientInfoDto)
  @IsNotEmpty()
  clientInfo!: ClientInfoDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsNotEmpty()
  items!: OrderItemDto[];

  @IsEnum(PaymentMethod)
  payment_method!: PaymentMethod;

  @IsOptional()
  @IsInt({ message: 'O valor do troco deve ser um número inteiro.' })
  @IsPositive({ message: 'O valor do troco deve ser positivo.' })
  @Type(() => Number)
  change_for?: number;
}
