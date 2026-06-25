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
import { SkillsService } from './skills.service';
import { GetSkillsQueryDto } from './dto/get-skills.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/types/auth.types';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  async findAll(@Query() query: GetSkillsQueryDto) {
    return this.skillsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createSkillDto: CreateSkillDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.skillsService.create(createSkillDto, Number(req.user.sub));
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSkillDto: UpdateSkillDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.skillsService.update(id, updateSkillDto, Number(req.user.sub));
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.skillsService.delete(id, Number(req.user.sub));
  }
}
