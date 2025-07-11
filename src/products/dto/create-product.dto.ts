import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'O nome do produto. Deve ser único.',
    example: 'Laptop Pro',
  })
  @IsString({ message: 'O nome deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome não pode estar vazio.' })
  name!: string;

  @ApiProperty({
    description: 'A descrição detalhada do produto.',
    example: 'Laptop de alta performance com 16GB de RAM.',
    required: false,
  })
  @IsString({ message: 'A descrição deve ser uma string.' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description:
      'O preço do produto em centavos (ex: R$ 5999,99 deve ser enviado como 599999).',
    example: 599999,
  })
  @IsNumber({}, { message: 'O preço deve ser um número.' })
  @IsPositive({ message: 'O preço deve ser um valor positivo.' })
  @IsInt({ message: 'O preço deve ser um número inteiro (em centavos).' })
  price!: number;

  @ApiProperty({
    description: 'A quantidade do produto em estoque.',
    example: 50,
    default: 0,
    required: false,
  })
  @IsInt({ message: 'O estoque deve ser um número inteiro.' })
  @Min(0, { message: 'O estoque não pode ser negativo.' })
  @IsOptional()
  stock?: number;
}
