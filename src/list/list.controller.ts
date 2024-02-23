import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Patch,
} from '@nestjs/common';
import { ListService } from './list.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { CopyListDto } from './dto/copy-list.dto';
import { UpdateOrderListDto } from './dto/update-list-order.dto';

@Controller('list')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Post()
  create(@Body() createListDto: CreateListDto) {
    return this.listService.create(createListDto);
  }

  @Get()
  findAll(
    @Query()
    { boardId }: { boardId: string },
  ) {
    return this.listService.findAll({ boardId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.listService.remove(id);
  }

  @Patch('/order')
  updateListOrder(@Body() updateOrderListDto: UpdateOrderListDto) {
    console.log('a');

    return this.listService.updateListOrder(updateOrderListDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateListDto: UpdateListDto) {
    return this.listService.update(id, updateListDto);
  }

  @Post('/copy')
  copy(@Body() copyListDto: CopyListDto) {
    return this.listService.copy(copyListDto);
  }
}
