import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListDto } from './dto/create-list.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateListDto } from './dto/update-list.dto';
import { CopyListDto } from './dto/copy-list.dto';
import { UpdateOrderListDto } from './dto/update-list-order.dto';

@Injectable()
export class ListService {
  constructor(private prisma: PrismaService) {}

  async create(createListDto: CreateListDto) {
    const { boardId, title } = createListDto;

    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const lastList = await this.prisma.list.findFirst({
      where: { boardId: boardId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const newOrder = lastList ? lastList.order + 1 : 1;

    const list = await this.prisma.list.create({
      data: {
        title,
        boardId,
        order: newOrder,
      },
    });

    return list;
  }

  async findAll({ boardId }) {
    return await this.prisma.list.findMany({
      where: { boardId },
      orderBy: { order: 'asc' },
      include: { cards: { orderBy: { order: 'asc' } } },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} list`;
  }

  async remove(id: string) {
    const list = await this.prisma.list.findUnique({
      where: { id },
    });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    const deletedList = await this.prisma.list.delete({ where: { id } });

    return deletedList;
  }

  async update(id: string, updateListDto: UpdateListDto) {
    const { boardId, title } = updateListDto;

    const foundList = await this.prisma.list.findUnique({
      where: { id },
    });

    if (!foundList) {
      throw new NotFoundException('List not found');
    }

    const org = await this.prisma.org.findFirst({
      where: { boards: { some: { id: boardId } } },
    });

    const list = await this.prisma.list.update({
      where: {
        id,
        boardId,
        board: {
          orgId: org.id,
        },
      },
      data: {
        title,
      },
    });

    return list;
  }

  async copy(copyListDto: CopyListDto) {
    const { boardId, id } = copyListDto;

    const org = await this.prisma.org.findFirst({
      where: { boards: { some: { id: boardId } } },
    });

    const listToCopy = await this.prisma.list.findUnique({
      where: {
        id,
        boardId,
        board: {
          orgId: org.id,
        },
      },
      include: {
        cards: true,
      },
    });

    if (!listToCopy) {
      return { error: 'List not found' };
    }

    const lastList = await this.prisma.list.findFirst({
      where: { boardId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const newOrder = lastList ? lastList.order + 1 : 1;

    const list = await this.prisma.list.create({
      data: {
        boardId: listToCopy.boardId,
        title: `${listToCopy.title} - Copy`,
        order: newOrder,
        cards: {
          createMany: {
            data: listToCopy.cards.map((card) => ({
              title: card.title,
              description: card.description,
              order: card.order,
            })),
          },
        },
      },
      include: {
        cards: true,
      },
    });

    return list;
  }

  async updateListOrder(updateOrderListDto: UpdateOrderListDto) {
    const { boardId, items } = updateOrderListDto;

    const org = await this.prisma.org.findFirst({
      where: { boards: { some: { id: boardId } } },
    });

    const transaction = items.map((list) =>
      this.prisma.list.update({
        where: {
          id: list.id,
          board: {
            orgId: org.id,
          },
        },
        data: {
          order: list.order,
        },
      }),
    );

    const lists = await this.prisma.$transaction(transaction);

    return lists;
  }
}
