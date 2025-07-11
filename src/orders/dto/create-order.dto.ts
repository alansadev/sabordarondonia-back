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
}
