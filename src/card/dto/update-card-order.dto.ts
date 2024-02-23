import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class UpdateOrderCardDto {
  @IsNotEmpty()
  @IsArray()
  items: {
    id: string;
    title: string;
    order: number;
    listId: string;
    createdAt: Date;
    updateAt: Date;
  }[];

  @IsNotEmpty()
  @IsString()
  boardId: string;
}
