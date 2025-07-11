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
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO interno para validar os dados do cliente
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

// DTO interno para validar cada item do pedido
class OrderItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;
}

export class CreateOrderDto {
  @ValidateNested() // Diz ao class-validator para validar o objeto aninhado
  @Type(() => ClientInfoDto) // Especifica o tipo do objeto aninhado
  @IsNotEmpty()
  clientInfo!: ClientInfoDto;

  @IsArray()
  @ValidateNested({ each: true }) // Valida cada item do array
  @Type(() => OrderItemDto)
  @IsNotEmpty()
  items!: OrderItemDto[];
}
