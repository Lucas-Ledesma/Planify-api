import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateOrderCardDto } from './dto/update-card-order.dto';

@Injectable()
export class CardService {
  constructor(private prisma: PrismaService) {}

  async create(createCardDto: CreateCardDto) {
    const { boardId, listId, title } = createCardDto;

    const org = await this.prisma.org.findFirst({
      where: { boards: { some: { id: boardId } } },
    });

    const list = await this.prisma.list.findUnique({
      where: {
        id: listId,
        board: {
          orgId: org.id,
        },
      },
    });

    if (!list) {
      throw new NotFoundException('List not found');
    }

    const lastCard = await this.prisma.card.findFirst({
      where: { listId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const newOrder = lastCard ? lastCard.order + 1 : 1;

    const card = await this.prisma.card.create({
      data: {
        title,
        listId,
        order: newOrder,
      },
    });

    return card;
  }

  findAll() {
    return `This action returns all card`;
  }

  findOne(id: number) {
    return `This action returns a #${id} card`;
  }

  update(id: number, updateCardDto: UpdateCardDto) {
    return `This action updates a #${id} card`;
  }

  remove(id: number) {
    return `This action removes a #${id} card`;
  }

  async updateCardOrder(updateOrderCard: UpdateOrderCardDto) {
    const { boardId, items } = updateOrderCard;

    const org = await this.prisma.org.findFirst({
      where: { boards: { some: { id: boardId } } },
    });

    const transaction = items.map((card) =>
      this.prisma.card.update({
        where: {
          id: card.id,
          list: {
            board: {
              orgId: org.id,
            },
          },
        },
        data: {
          order: card.order,
          listId: card.listId,
        },
      }),
    );

    const updatedCards = await this.prisma.$transaction(transaction);

    return updatedCards;
  }
}
