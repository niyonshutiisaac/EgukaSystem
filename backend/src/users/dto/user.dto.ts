import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class InviteUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  name?: string;

  @IsEnum(Role)
  role: Exclude<Role, 'superadmin'>;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  temporaryPassword?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Exclude<Role, 'superadmin'>;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsString()
  status?: 'active' | 'disabled';
}
