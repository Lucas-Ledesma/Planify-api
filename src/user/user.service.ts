import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';

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

    return { user: findUser };
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
    const user = await this.prisma.user.findUnique({ where: { email } });

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
}
