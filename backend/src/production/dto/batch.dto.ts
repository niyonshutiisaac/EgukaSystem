import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateBatchDto {
  @IsString()
  recipeId: string;

  @IsInt()
  @Min(1)
  plannedQty: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}

export class CompleteBatchDto {
  @IsInt()
  @Min(0)
  completedQty: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  wasteQty?: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}

export class FailBatchDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}
