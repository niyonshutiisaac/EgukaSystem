import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { PlanId, TenantStatus } from '@prisma/client';

export class ApproveRequestDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  trialDays?: number;
}

export class RejectRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class UpdateTenantStatusDto {
  @IsEnum(TenantStatus)
  status: TenantStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  trialDays?: number;
}

export class ChangePlanDto {
  @IsEnum(PlanId)
  planId: PlanId;

  @IsOptional()
  @IsInt()
  @Min(0)
  days?: number;
}
