import { IsNotEmpty, IsString } from 'class-validator';

export class CreateListDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  boardId: string;
}
