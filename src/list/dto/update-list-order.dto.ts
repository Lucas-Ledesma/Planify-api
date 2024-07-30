import { IsArray, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class UpdateOrderListDto {
  @IsNotEmpty()
  @IsArray()
  items: {
    id: string;
    title: string;
    order: number;
    createdAt: Date;
    updateAt: Date;
  }[];

  @IsNotEmpty()
  @IsString()
  boardId: string;
}
