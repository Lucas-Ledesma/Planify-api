import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateListDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  boardId: string;
}
