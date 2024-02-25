import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCardDto {
  @IsString()
  @IsNotEmpty()
  boardId: string;

  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;
}
