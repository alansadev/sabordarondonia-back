import { IsInt, IsPositive, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddProductDto {
  @ApiProperty({
    description: 'ID do produto (UUID)',
    example: 'a4f49278-64e7-46eb-889b-d5ab835046eb',
  })
  @IsUUID()
  productId!: string;

  @ApiProperty({
    description: 'Quantidade do produto',
    example: 3,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  quantity!: number;
}
