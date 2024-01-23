import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const findUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (findUser) {
      throw new ForbiddenException('Credentials already taken');
    }

    const user = await this.prisma.user.create({
      data: { email: createUserDto.email, password: createUserDto.password },
    });

    return { user };
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

  async delete(id: string) {
    const foundUser = await this.prisma.user.findUnique({ where: { id } });

    if (!foundUser) {
      throw new ForbiddenException('Wrong Id');
    }

    await this.prisma.user.delete({ where: { id } });

    return { msg: 'User was deleted sucessfully' };
  }
}
