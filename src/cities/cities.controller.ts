import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { City } from './entities/cities.entity';

@ApiTags('cities')
@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @ApiOperation({ summary: 'Post a new city' })
  @ApiCreatedResponse({
    description: 'The city is created',
  })
  @ApiBearerAuth()
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() createCityDto: CreateCityDto) {
    return this.citiesService.create(createCityDto);
  }

  @ApiOperation({ summary: 'Get a list of cities' })
  @ApiOkResponse({
    description: 'The cities list is received',
    type: [City],
  })
  @Get()
  findAll(@Query('search') search?: string) {
    return this.citiesService.findAll(search);
  }

  @ApiOperation({ summary: 'Get a city by id' })
  @ApiCreatedResponse({
    description: 'The city is found by its id',
    type: City,
  })
  @ApiNotFoundResponse({
    description: 'City not found',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.citiesService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a city by id' })
  @ApiOkResponse({
    description: 'City is updated by its id',
  })
  @ApiNotFoundResponse({
    description: 'City not found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCityDto: UpdateCityDto) {
    return this.citiesService.update(+id, updateCityDto);
  }

  @ApiOperation({ summary: 'Delete a city by id' })
  @ApiOkResponse({
    description: 'The city is deleted by its id',
  })
  @ApiNotFoundResponse({
    description: 'City not found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.citiesService.remove(+id);
  }
}
