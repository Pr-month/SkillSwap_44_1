import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { SkillsService } from './skills.service';
import { GetSkillsQueryDto } from './dto/get-skills.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

type RequestWithUser = Request & {
  user: {
    id: number;
  };
};

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  async findAll(@Query() query: GetSkillsQueryDto) {
    return this.skillsService.findAll(
      query.page,
      query.limit,
      query.search,
      query.category,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createSkillDto: CreateSkillDto,
    @Req() req: RequestWithUser,
  ) {
    return this.skillsService.create(createSkillDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSkillDto: UpdateSkillDto,
    @Req() req: RequestWithUser,
  ) {
    return this.skillsService.update(id, updateSkillDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.skillsService.delete(id, req.user.id);
  }
}
