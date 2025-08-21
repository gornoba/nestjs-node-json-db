import { Controller, Get, Post } from '@nestjs/common';
import { TmpService } from './tmp.service';

@Controller('tmp')
export class TmpController {
  constructor(private readonly tmpService: TmpService) {}

  @Post('create')
  async create() {
    const data = await this.tmpService.create();
    return data;
  }

  @Get('find')
  async find() {
    const data = await this.tmpService.find();
    return data;
  }
}
