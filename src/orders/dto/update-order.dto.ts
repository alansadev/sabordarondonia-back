import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatusEnum } from '../entities/order-status.enum';

export class UpdateOrderDto {
  @ApiProperty({
    description: 'Novo status do pedido',
    enum: OrderStatusEnum,
    example: OrderStatusEnum.AWAITING_DISPATCH,
    enumName: 'OrderStatusEnum',
    required: false,
  })
  @IsEnum(OrderStatusEnum)
  @IsOptional()
  status?: OrderStatusEnum;
}
