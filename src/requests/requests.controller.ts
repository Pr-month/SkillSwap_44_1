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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Requests')
@ApiBearerAuth()
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('outgoing')
  @ApiOperation({ summary: 'Get outgoing requests' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async outgoing(@Req() req: AuthenticatedRequest) {
    return this.requestsService.outgoing(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('incoming')
  @ApiOperation({ summary: 'Get incoming requests' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async incoming(@Req() req: AuthenticatedRequest) {
    return this.requestsService.incoming(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async delete(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    console.log('Delete request called with id:', id, 'by user:', req.user);
    return this.requestsService.remove(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create request' })
  @ApiResponse({ status: 201, description: 'Request created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createRequestDto: CreateRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.requestsService.create(createRequestDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update request' })
  @ApiResponse({ status: 200, description: 'Request updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async update(
    @Param('id') id: string,
    @Body() updateRequestDto: UpdateRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.requestsService.update(id, updateRequestDto, req.user);
  }
}
