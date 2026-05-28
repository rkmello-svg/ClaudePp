import { IsString, IsNumber, IsPositive, IsNotEmpty, Matches } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  description?: string;

  @IsString()
  @Matches(/^[0-9]{13}$/, { message: 'Barcode must be 13 digits' })
  barcode!: string;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsNumber()
  cost?: number;

  @IsNumber()
  stock?: number;

  @IsString()
  category?: string;
}
