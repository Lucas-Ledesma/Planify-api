import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InvitUserDto } from './dto/invite-user.dto';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.create(createOrganizationDto);
  }

  @Post('/invite')
  invite(@Body() InvitUserDto: InvitUserDto) {
    return this.organizationService.inviteUserToOrganization(InvitUserDto);
  }

  @Get()
  findAll(
    @Query()
    {
      boardId,
      userId,
      email,
      orgId,
    }: {
      boardId: string;
      userId: string;
      email: string;
      orgId: string;
    },
  ) {
    return this.organizationService.findAll({ boardId, userId, email, orgId });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationService.remove(id);
  }
}
