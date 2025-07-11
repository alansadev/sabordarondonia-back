import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatusEnum } from '../entities/order-status.enum';

export class UpdateOrderDto {
  @IsEnum(OrderStatusEnum)
  @IsOptional()
  status?: OrderStatusEnum;
}
