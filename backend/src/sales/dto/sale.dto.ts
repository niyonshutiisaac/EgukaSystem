import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class SaleItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  qty: number;

  /** Server re-validates unit price against the product's current price. */
  @IsInt()
  @Min(0)
  unitPrice: number;
}

export class CreateSaleDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  idempotencyKey?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @IsOptional()
  @IsInt()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  tax?: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  /** Amount tendered by the customer; change is computed server-side. */
  @IsInt()
  @Min(0)
  paid: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}

export class VoidSaleDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}
