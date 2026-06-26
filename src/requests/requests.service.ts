import { Injectable } from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';

@Injectable()
export class RequestsService {
  create(createRequestDto: CreateRequestDto) {
    return 'This action adds a new request';
  }

  incoming() {
    return `This action returns incoming requests`;
  }

  outgoing() {
    return `This action returns outgoing requests`;
  }

  update(id: number, updateRequestDto: UpdateRequestDto) {
    return `This action updates a #${id} request`;
  }

  remove(id: number) {
    return `This action removes a #${id} request`;
  }
}
