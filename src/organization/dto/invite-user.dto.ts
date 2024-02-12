import { Role } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InvitUserDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsString()
  @IsNotEmpty()
  orgId: string;
}
