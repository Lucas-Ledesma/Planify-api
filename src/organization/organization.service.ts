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

    return createdOrg;
  }

  async inviteUserToOrganization(invitUserDto: InvitUserDto) {
    const { id, orgId } = invitUserDto;

    const foundUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    const foundOrg = await this.prisma.org.findUnique({
      where: { id: orgId },
    });

    if (!foundOrg) {
      throw new NotFoundException('Organization not found');
    }

    const existingInvitation = await this.prisma.userFromOrganization.findFirst(
      {
        where: {
          userId: foundUser.id,
          orgId: orgId,
        },
      },
    );

    if (existingInvitation) {
      throw new ConflictException(
        'User is already invited to this organization',
      );
    }

    const notification = await this.prisma.notification.findFirst({
      where: { receiverId: foundUser.id },
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
        userId: foundUser.id,
        orgId: orgId,

        joined,
      },
      include: { user: true },
    });

    return invitedUser;
  }

  findAll() {
    return `This action returns all organization`;
  }

  async findByUser(id: string) {
    const orgs = await this.prisma.org.findMany({
      where: {
        usersFromOrg: {
          some: {
            userId: id,
          },
        },
      },
      include: {
        usersFromOrg: true,
      },
    });

    if (!orgs) {
      throw new ForbiddenException('Wrong user id');
    }

    return orgs;
  }

  async findById(id: string) {
    const orgs = await this.prisma.org.findUnique({
      where: { id },
      include: { usersFromOrg: { include: { user: true } } },
    });

    if (!orgs) {
      throw new ForbiddenException('wrong id');
    }

    return orgs;
  }

  update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
    return `This action updates a #${id} organization`;
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

    await this.prisma.org.delete({ where: { id } });

    return { msg: 'Org was deleted sucessfully' };
  }
}
