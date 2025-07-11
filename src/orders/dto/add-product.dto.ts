import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class AddProductDto {
  @IsUUID()
  productId!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;
}
