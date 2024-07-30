import { Role } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class RoleUserDto {
  @IsNotEmpty()
  role: Role;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  orgId: string;
}
