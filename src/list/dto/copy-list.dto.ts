import { IsNotEmpty, IsString } from 'class-validator';

export class CopyListDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  boardId: string;
}
