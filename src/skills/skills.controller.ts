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
import { ApiTags } from '@nestjs/swagger';
import {
  ApiSkillsDelete,
  ApiSkillsDeleteFavorite,
  ApiSkillsGetFindAll,
  ApiSkillsGetFindSimilar,
  ApiSkillsPost,
  ApiSkillsPostFavorite,
  ApiSkillsUpdate,
} from './skills.swagger';

@ApiTags('skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @ApiSkillsGetFindAll()
  @Get()
  async findAll(@Query() query: GetSkillsQueryDto) {
    return this.skillsService.findAll(query);
  }

  @ApiSkillsGetFindSimilar()
  // эндпоинт для получения похожих карточек
  @Get(':id/similar')
  async findSimilar(@Param('id', ParseIntPipe) id: number) {
    return this.skillsService.findSimilar(id);
  }

  @ApiSkillsPost()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createSkillDto: CreateSkillDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.skillsService.create(createSkillDto, req.user.sub);
  }

  @ApiSkillsPostFavorite()
  @UseGuards(JwtAuthGuard)
  @Post(':id/favorite')
  async addToFavorites(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.skillsService.addToFavorites(id, req.user.sub);
  }

  @ApiSkillsUpdate()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSkillDto: UpdateSkillDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.skillsService.update(id, updateSkillDto, req.user.sub);
  }

  @ApiSkillsDelete()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.skillsService.delete(id, req.user.sub);
  }

  @ApiSkillsDeleteFavorite()
  @UseGuards(JwtAuthGuard)
  @Delete(':id/favorite')
  async removeFromFavorites(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.skillsService.removeFromFavorites(id, req.user.sub);
  }
}
