import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { RoleUserDto } from './dto/role-user.dto';
import { NotificationUserDto } from './dto/notification-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const findUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (findUser) {
      throw new NotFoundException({ msg: 'Email already taken' });
    }

    if (!createUserDto.image) {
      createUserDto.image =
        'https://cdn-icons-png.freepik.com/256/1144/1144760.png';
    }

    let hashedPassword = '';

    if (createUserDto.password) {
      hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    }

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        password: hashedPassword,
        providerId: createUserDto.providerId,
        image: createUserDto.image,
      },
    });

    return { user };
  }

  async login(LoginUserDto: LoginUserDto) {
    const findUser = await this.prisma.user.findUnique({
      where: { email: LoginUserDto.email },
    });

    if (
      !findUser ||
      !(await bcrypt.compare(LoginUserDto.password, findUser.password))
    ) {
      return { error: 'Invalid credentials', statusCode: 401 };
    }

    return { msg: 'Loggin Succesfully' };
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: string) {
    const foundUser = await this.prisma.user.findUnique({ where: { id } });

    if (!foundUser) {
      throw new ForbiddenException('Wrong Id');
    }

    return foundUser;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findFirst({ where: { email } });

    if (!user) {
      throw new ForbiddenException('wrong email');
    }

    return user;
  }

  async delete(id: string) {
    const foundUser = await this.prisma.user.findUnique({ where: { id } });

    if (!foundUser) {
      throw new ForbiddenException('Wrong Id');
    }

    await this.prisma.user.delete({ where: { id } });

    return { msg: 'User was deleted sucessfully' };
  }

  async changeRole(RoleUserDto: RoleUserDto) {
    const { role, userId, orgId } = RoleUserDto;

    const userOrg = await this.prisma.userFromOrganization.findUnique({
      where: {
        userId_orgId: { userId, orgId },
      },
    });

    if (!userOrg) {
      throw new NotFoundException('User organization entry not found');
    }

    await this.prisma.userFromOrganization.update({
      where: {
        userId_orgId: { userId, orgId },
      },
      data: { role },
    });

    return { msg: 'Role updated successfuly' };
  }

  async createNotification(NotificationUserDto: NotificationUserDto) {
    const { id, orgId, email } = NotificationUserDto;

    const receiverUser = await this.prisma.user.findFirst({ where: { email } });

    if (!receiverUser) {
      throw new NotFoundException('User not found');
    }

    const senderUser = await this.prisma.user.findFirst({ where: { id } });

    if (!senderUser) {
      throw new NotFoundException('User not found');
    }

    const foundOrg = await this.prisma.org.findFirst({ where: { id: orgId } });

    if (!foundOrg) {
      throw new NotFoundException('Org not found');
    }

    const existingInvitation = await this.prisma.userFromOrganization.findFirst(
      {
        where: {
          userId: receiverUser.id,
          orgId: orgId,
        },
      },
    );

    if (existingInvitation) {
      throw new ConflictException(
        'User is already invited to this organization',
      );
    }

    const createdAt = new Date();

    const notification = await this.prisma.notification.create({
      data: {
        status: 'PENDING',
        organizationId: orgId,
        createdAt,
        receiverId: receiverUser.id,
        senderId: id,
      },
    });

    return { msg: 'invitation sended' };
  }

  async getNotification(id: string) {
    const foundUser = await this.prisma.user.findFirst({ where: { id } });

    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    const notification = await this.prisma.notification.findMany({
      where: { receiverId: id },
      include: { organization: true, receiver: true, sender: true },
    });

    return notification;
  }

  async deleteNotification(id: string) {
    const foundNotification = await this.prisma.notification.findFirst({
      where: { id },
    });

    if (!foundNotification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({ where: { id } });

    return { msg: 'your notification was deleted successffuly' };
  }
}
