import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class FindOrCreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(11)
  phone!: string;
}
