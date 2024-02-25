import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateOrderCardDto } from './dto/update-card-order.dto';

@Injectable()
export class CardService {
  constructor(private prisma: PrismaService) {}

  async create(createCardDto: CreateCardDto) {
    console.log('a');

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

  async findOne(id: string) {
    if (id === 'undefined') {
      return {};
    }

    const org = await this.prisma.org.findFirst({
      where: {
        boards: { some: { lists: { some: { cards: { some: { id } } } } } },
      },
    });

    if (!org) {
      throw new NotFoundException('Org not found');
    }

    const card = await this.prisma.card.findUnique({
      where: { id, list: { board: { orgId: org.id } } },
      include: { list: { select: { title: true } } },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    return card;
  }

  async update(id: string, updateCardDto: UpdateCardDto) {
    const { boardId, description, title } = updateCardDto;

    const foundedCard = await this.prisma.card.findUnique({ where: { id } });

    if (!foundedCard) {
      throw new NotFoundException('Card not found');
    }

    const org = await this.prisma.org.findFirst({
      where: {
        boards: { some: { id: boardId } },
      },
    });

    if (!org) {
      throw new NotFoundException('Org not found');
    }

    const card = await this.prisma.card.update({
      where: {
        id,
        list: {
          board: {
            orgId: org.id,
          },
        },
      },
      data: {
        title,
        description,
      },
    });

    return card;
  }

  async remove(id: string) {
    const foundedCard = await this.prisma.card.findUnique({ where: { id } });

    if (!foundedCard) {
      throw new NotFoundException('Card not found');
    }

    const org = await this.prisma.org.findFirst({
      where: {
        boards: { some: { lists: { some: { cards: { some: { id } } } } } },
      },
    });

    if (!org) {
      throw new NotFoundException('Org not found');
    }

    const deletedCard = await this.prisma.card.delete({
      where: {
        id,
        list: {
          board: {
            orgId: org.id,
          },
        },
      },
    });

    return deletedCard;
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
