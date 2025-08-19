import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { UserEntity } from 'src/entity/user.entity';
import { ApiQuery } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: any) {
    return this.userService.saveData('/', createUserDto as UserEntity);
  }

  @Get()
  @ApiQuery({ name: 'key', required: false })
  async findAll(@Query('key') key: string) {
    return await this.userService.getData(key);
  }
}
