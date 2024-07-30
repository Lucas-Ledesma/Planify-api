import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  email: string;
}
