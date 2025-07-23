import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, ArrayNotEmpty } from 'class-validator';

export class FindProductsByIdsDto {
  @ApiProperty({
    description: 'Uma lista de IDs de produtos (UUIDs) para buscar.',
    example: [
      'a1b2c3d4-e5f6-7890-1234-567890abcdef',
      'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
    ],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', {
    each: true,
    message: 'Cada ID no array deve ser um UUID válido.',
  })
  ids!: string[];
}
