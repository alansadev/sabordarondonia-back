import { IsMongoId, IsInt, IsPositive } from 'class-validator';

export class AddProductDto {
  @IsMongoId()
  productId!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;
}
