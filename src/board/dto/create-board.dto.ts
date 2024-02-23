import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  imageId: string;

  @IsString()
  @IsNotEmpty()
  imageThumbUrl: string;

  @IsString()
  @IsNotEmpty()
  imageFullUrl: string;

  @IsString()
  @IsNotEmpty()
  imageUserName: string;

  @IsString()
  @IsNotEmpty()
  imageLinkHTML: string;

  @IsString()
  @IsNotEmpty()
  orgId: string;
}
