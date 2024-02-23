import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { InvitUserDto } from './dto/invite-user.dto';
import { UpdateBoardDto } from 'src/board/dto/update-board.dto';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async create(createOrganizationDto: CreateOrganizationDto) {
    const { title, email } = createOrganizationDto;

    const foundUser = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!foundUser) {
      throw new ForbiddenException('user not found');
    }

    const createdAt = new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
    });

    const createdOrg = await this.prisma.org.create({
      data: {
        title,
        createdAt,
        usersFromOrg: {
          create: [
            {
              user: { connect: { id: foundUser.id } },
              role: 'ADMIN',
              joined: createdAt,
            },
          ],
        },
      },
      include: { usersFromOrg: { include: { user: true } } },
    });

    return { msg: 'organization was created successfully' };
  }

  async inviteUserToOrganization(invitUserDto: InvitUserDto) {
    const { id, orgId, email } = invitUserDto;

    const sender = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!sender) {
      throw new NotFoundException('User not found');
    }

    const reciever = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!reciever) {
      throw new NotFoundException('User not found');
    }

    const foundOrg = await this.prisma.org.findUnique({
      where: { id: orgId },
    });

    if (!foundOrg) {
      throw new NotFoundException('Organization not found');
    }

    const notification = await this.prisma.notification.findFirst({
      where: { receiverId: reciever.id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({ where: { id: notification.id } });

    const joined = new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
    });

    const invitedUser = await this.prisma.userFromOrganization.create({
      data: {
        userId: reciever.id,
        orgId: orgId,
        joined,
      },
      include: { user: true },
    });

    return { msg: 'the user was successfully invited' };
  }

  async findAll({
    boardId,
    userId,
    email,
    orgId,
  }: {
    boardId: string;
    userId: string;
    email: string;
    orgId: string;
  }) {
    const organizations = await this.prisma.org.findMany({
      where: {
        usersFromOrg: { some: { userId } },

        id: orgId,
      },
      include: {
        usersFromOrg: { include: { user: true } },
        boards: true,
      },
    });

    return organizations;
  }

  async remove(id: string) {
    const foundOrg = await this.prisma.org.findUnique({ where: { id } });

    if (!foundOrg) {
      throw new ForbiddenException('Wrong Id');
    }

    await this.prisma.list.deleteMany({
      where: { board: { orgId: id } },
    });

    await this.prisma.board.deleteMany({
      where: { orgId: id },
    });

    await this.prisma.userFromOrganization.deleteMany({
      where: { orgId: id },
    });

    await this.prisma.notification.deleteMany({
      where: { organizationId: id },
    });

    await this.prisma.org.delete({ where: { id } });

    return { msg: 'Org was deleted sucessfully' };
  }
}
