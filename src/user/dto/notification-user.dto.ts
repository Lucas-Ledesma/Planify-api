import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class NotificationUserDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  @IsNotEmpty()
  orgId: string;
}
