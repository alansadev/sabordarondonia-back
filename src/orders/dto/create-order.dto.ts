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
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from 'src/orders/entities/payment-method.enum';

class ClientInfoDto {
  @ApiProperty({
    description: 'Nome completo do cliente',
    example: 'João da Silva',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Telefone do cliente com DDD, sem formatação',
    example: '69912345678',
    minLength: 10,
    maxLength: 11,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(11)
  phone!: string;
}

class OrderItemDto {
  @ApiProperty({
    description: 'ID do produto (UUID)',
    example: 'a4f49278-64e7-46eb-889b-d5ab835046eb',
  })
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({
    description: 'Quantidade do produto',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Informações do cliente',
    type: ClientInfoDto,
    example: {
      name: 'João da Silva',
      phone: '69912345678',
    },
  })
  @ValidateNested()
  @Type(() => ClientInfoDto)
  @IsNotEmpty()
  clientInfo!: ClientInfoDto;

  @ApiProperty({
    description: 'Lista de itens do pedido',
    type: [OrderItemDto],
    example: [
      {
        productId: 'a4f49278-64e7-46eb-889b-d5ab835046eb',
        quantity: 2,
      },
      {
        productId: 'b5g59389-75f8-57fc-990c-e6bc946157fc',
        quantity: 1,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsNotEmpty()
  items!: OrderItemDto[];

  @ApiProperty({
    description: 'Método de pagamento',
    enum: PaymentMethod,
    example: PaymentMethod.PIX,
    enumName: 'PaymentMethod',
  })
  @IsEnum(PaymentMethod)
  payment_method!: PaymentMethod;

  @ApiProperty({
    description: 'Valor do troco em centavos (necessário apenas para pagamento em dinheiro)',
    example: 500,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'O valor do troco deve ser um número inteiro.' })
  @IsPositive({ message: 'O valor do troco deve ser positivo.' })
  @Type(() => Number)
  change_for?: number;
}
