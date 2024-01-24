import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PrismaService } from 'src/prisma/prisma.service';

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

    const createdOrg = await this.prisma.org.create({
      data: {
        title,
        ownerId: foundUser.id,
      },
    });

    return createdOrg;
  }

  findAll() {
    return `This action returns all organization`;
  }

  async findByOwner(id: string) {
    const orgs = await this.prisma.org.findMany({ where: { ownerId: id } });

    if (!orgs) {
      throw new ForbiddenException('wrong user id');
    }

    return orgs;
  }

  update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
    return `This action updates a #${id} organization`;
  }

  remove(id: number) {
    return `This action removes a #${id} organization`;
  }
}
