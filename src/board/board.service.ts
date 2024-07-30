import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BoardService {
  constructor(private prisma: PrismaService) {}

  async create(createBoardDto: CreateBoardDto) {
    const {
      imageFullUrl,
      imageId,
      imageLinkHTML,
      imageThumbUrl,
      imageUserName,
      orgId,
      title,
    } = createBoardDto;

    const foundOrg = await this.prisma.org.findUnique({ where: { id: orgId } });

    if (!foundOrg) {
      throw new ForbiddenException('Organization not found');
    }

    const createdBoard = await this.prisma.board.create({
      data: {
        imageFullUrl,
        imageId,
        imageLinkHTML,
        imageThumbUrl,
        imageUserName,
        orgId,
        title,
      },
    });

    return createdBoard;
  }

  async findAll({ boardId, orgId }: { boardId: string; orgId: string }) {
    const boards = await this.prisma.board.findMany({
      where: { id: boardId, orgId },
    });

    return boards;
  }

  async findByOrg(orgId: string) {
    const foundOrg = await this.prisma.org.findUnique({
      where: { id: orgId },
    });

    if (!foundOrg) {
      throw new ForbiddenException('Organization not found');
    }

    const boards = await this.prisma.board.findMany({ where: { orgId } });

    return boards;
  }

  findOne(id: number) {
    return `This action returns a #${id} board`;
  }

  async update(id: string, updateBoardDto: UpdateBoardDto) {
    const { title, orgId } = updateBoardDto;

    const foundBoard = await this.prisma.board.findFirst({
      where: { id },
    });

    if (!foundBoard) {
      throw new ForbiddenException('Board not found');
    }

    const board = await this.prisma.board.update({
      where: {
        id,
        orgId,
      },
      data: {
        title,
      },
    });

    return board;
  }

  async remove(id: string) {
    const foundBoard = await this.prisma.board.findUnique({
      where: { id },
      include: { organization: true },
    });

    if (!foundBoard) {
      throw new ForbiddenException('Board was not found');
    }

    await this.prisma.board.delete({ where: { id } });

    return foundBoard;
  }
}
