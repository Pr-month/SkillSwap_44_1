import {
  Controller,
  Get,
  Param,
  Delete,
  Req,
  UseGuards,
  Body,
  Post,
} from '@nestjs/common';
import { RequestsService } from './requests.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/types/auth.types';
import { CreateRequestDto } from './dto/create-request.dto';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('outgoing')
  async outgoing(@Req() req: AuthenticatedRequest) {
    return this.requestsService.outgoing(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    console.log('Delete request called with id:', id, 'by user:', req.user);
    return this.requestsService.remove(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createRequestDto: CreateRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.requestsService.create(createRequestDto, req.user);
  }
}
