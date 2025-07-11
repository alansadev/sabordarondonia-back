import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class AddProductDto {
  @IsUUID() // Corrigido de IsMongoId para IsUUID
  productId!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;
}
