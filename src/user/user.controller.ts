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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RoleUserDto } from './dto/role-user.dto';
import { NotificationUserDto } from './dto/notification-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('/notification')
  notification(@Body() NotificationUserDto: NotificationUserDto) {
    return this.userService.createNotification(NotificationUserDto);
  }

  @Get('notification/:id')
  getNotification(@Param('id') id: string) {
    return this.userService.getNotification(id);
  }

  @Post('/login')
  login(@Body() LoginUserDto: LoginUserDto) {
    return this.userService.login(LoginUserDto);
  }

  @Post('/role')
  change(@Body() RoleUserDto: RoleUserDto) {
    return this.userService.changeRole(RoleUserDto);
  }

  @Get()
  findAll(@Query('email') email: string) {
    if (email) {
      return this.userService.findByEmail(email);
    }
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }

  @Delete('/notification/:id')
  notificationDelete(@Param('id') id: string) {
    return this.userService.deleteNotification(id);
  }
}
