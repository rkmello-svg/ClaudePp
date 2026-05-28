import { IsString, IsNumber, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CardDataDto {
  @IsString()
  number: string;

  @IsString()
  holderName: string;

  @IsNumber()
  expiryMonth: number;

  @IsNumber()
  expiryYear: number;

  @IsString()
  cvv: string;
}

export class PixDataDto {
  @IsString()
  cpfCnpj: string;
}

export class ProcessPaymentDto {
  @IsString()
  saleId: string;

  @IsNumber()
  amount: number;

  @IsEnum(['card', 'pix', 'cash'])
  method: 'card' | 'pix' | 'cash';

  @IsOptional()
  @IsNumber()
  installments?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CardDataDto)
  cardData?: CardDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PixDataDto)
  pixData?: PixDataDto;
}

export class PaymentStatusDto {
  @IsString()
  transactionId: string;
}
