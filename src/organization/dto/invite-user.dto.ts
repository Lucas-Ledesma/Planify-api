import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InvitUserDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  @IsNotEmpty()
  orgId: string;

  @IsString()
  @IsNotEmpty()
  id: string;
}
