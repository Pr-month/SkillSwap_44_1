import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { UserRole } from '../users/users.enums';
import { RequestsRepository } from './requests.repository';
import { IJwtPayload } from '../auth/types/auth.types';
import { JwtPayload } from '@supabase/supabase-js';

@Injectable()
export class RequestsService {
  constructor(private readonly requestsRepository: RequestsRepository) {}

  create(createRequestDto: CreateRequestDto) {
    return 'This action adds a new request';
  }

  incoming() {
    return `This action returns incoming requests`;
  }

  async outgoing(user: IJwtPayload) {
    return this.requestsRepository.getOutgoingRequests(user.sub);
  }

  update(id: number, updateRequestDto: UpdateRequestDto) {
    return `This action updates a #${id} request`;
  }

  async remove(id: string, user: IJwtPayload) {
    const request = await this.requestsRepository.findById(id);

    if (!request) {
      throw new NotFoundException(`request with id ${id} not found`);
    }

    const admin = user.roleId === UserRole.ADMIN;

    const owner = request.sender.id === user.sub;

    if (!admin && !owner) {
      throw new ForbiddenException(
        'you can delete only your own requests',
      );
    }

    await this.requestsRepository.remove(request);

    return {
      message: 'request is deleted',
    };

  }
}
