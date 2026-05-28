import { IsArray, IsObject, IsNumber, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SaleItemDto {
  productId!: string;
  quantity!: number;
  unitPrice!: number;
  discount?: number;
}

export class CreateSaleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items!: SaleItemDto[];

  @IsObject()
  payment!: {
    method: 'cash' | 'card' | 'check' | 'pix';
    amount: number;
    status: 'pending' | 'approved' | 'declined' | 'cancelled';
  };

  @IsNumber()
  discountPercent?: number;

  @IsEnum(['draft', 'completed', 'cancelled'])
  status?: string;
}
