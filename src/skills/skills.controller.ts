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
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiOkResponse, ApiTags, ApiNotFoundResponse, ApiForbiddenResponse, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Skill } from './entities/skill.entity';

@ApiTags('skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @ApiOperation({ summary: 'Returns the list of the skills' })
  @ApiOkResponse({
    description: 'A list of skills is received',
  })
  @ApiNotFoundResponse({
    description: 'Page not found',
  })
  @Get()
  async findAll(@Query() query: GetSkillsQueryDto) {
    return this.skillsService.findAll(query);
  }

  @ApiOperation({ summary: 'Returns the list of similar skills' })
  @ApiOkResponse({
    description: 'A list of similar skills is received',
    type: [Skill],
  })
  // эндпоинт для получения похожих карточек
  @Get(':id/similar')
  async findSimilar(@Param('id', ParseIntPipe) id: number) {
    return this.skillsService.findSimilar(id);
  }

  @ApiOperation({ summary: 'Creates a new skill' })
  @ApiCreatedResponse({
    description: 'A new skill is created',
    type: Skill,
  })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createSkillDto: CreateSkillDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.skillsService.create(createSkillDto, req.user.sub);
  }

  @ApiOperation({ summary: 'Adds to favorites' })
  @ApiCreatedResponse({
    description: 'The skill is added to favorites',
  })
  @ApiNotFoundResponse({
    description: 'Skill not found',
  })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @UseGuards(JwtAuthGuard)
  @Post(':id/favorite')
  async addToFavorites(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.skillsService.addToFavorites(id, req.user.sub);
  }

  @ApiOperation({ summary: 'Updates the skill' })
  @ApiOkResponse({
    description: 'The skill is updated',
    type: Skill,
  })  
  @ApiNotFoundResponse({
    description: 'Skill not found',
  })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSkillDto: UpdateSkillDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.skillsService.update(id, updateSkillDto, req.user.sub);
  }

  @ApiOperation({ summary: 'Removes the skill' })
  @ApiOkResponse({
    description: 'The skill is deleted',
  })
  @ApiNotFoundResponse({
    description: 'Skill not found',
  })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.skillsService.delete(id, req.user.sub);
  }

  @ApiOperation({ summary: 'Removes a skill from favorites' })
  @ApiOkResponse({
    description: 'The skill is removed from favorites',
  })
  @ApiNotFoundResponse({
    description: 'Skill not found',
  })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id/favorite')
  async removeFromFavorites(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.skillsService.removeFromFavorites(id, req.user.sub);
  }
}
