import {
  Controller,
  Get,
  Param,
  Delete,
  Req,
  UseGuards,
  Body,
  Post,
  Patch,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/types/auth.types';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiOutgoing,
  ApiIncoming,
  ApiCreate,
  ApiDelete,
  ApiUpdate,
} from './request.swagger';

@ApiTags('Requests')
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOutgoing()
  @Get('outgoing')
  async outgoing(@Req() req: AuthenticatedRequest) {
    return this.requestsService.outgoing(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiIncoming()
  @Get('incoming')
  async incoming(@Req() req: AuthenticatedRequest) {
    return this.requestsService.incoming(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiDelete()
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    console.log('Delete request called with id:', id, 'by user:', req.user);
    return this.requestsService.remove(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiCreate()
  @Post()
  async create(
    @Body() createRequestDto: CreateRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.requestsService.create(createRequestDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiUpdate()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRequestDto: UpdateRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.requestsService.update(id, updateRequestDto, req.user);
  }
}
