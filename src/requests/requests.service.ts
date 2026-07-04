import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '../users/users.enums';
import { RequestsRepository } from './requests.repository';
import { IJwtPayload } from '../auth/types/auth.types';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';

@Injectable()
export class RequestsService {
  constructor(private readonly requestsRepository: RequestsRepository) {}

  async create(createRequestDto: CreateRequestDto, user: IJwtPayload) {
    const { offeredSkillId, requestedSkillId } = createRequestDto;

    if (offeredSkillId === requestedSkillId) {
      throw new BadRequestException(
        'Offered and requested skills must be different',
      );
    }

    return this.requestsRepository.createRequest({
      offeredSkillId,
      requestedSkillId,
      userId: user.sub,
    });
  }

  async outgoing(user: IJwtPayload) {
    return this.requestsRepository.getOutgoingRequests(user.sub);
  }

  async incoming(user: IJwtPayload) {
    return this.requestsRepository.getIncomingRequests(user.sub);
  }

  async update(
    id: string,
    updateRequestDto: UpdateRequestDto,
    user: IJwtPayload,
  ) {
    return this.requestsRepository.updateIncomingStatus(
      id,
      updateRequestDto.status,
      user.sub,
    );
  }

  async remove(id: string, user: IJwtPayload) {
    const request = await this.requestsRepository.findById(id);

    if (!request) {
      throw new NotFoundException(`Request with id ${id} not found`);
    }

    const isAdmin = user.roleId === UserRole.ADMIN;
    const isOwner = String(request.senderId) === String(user.sub);

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('You can delete only your own requests');
    }

    await this.requestsRepository.delete({ id });

    return {
      message: 'Request is deleted',
      id,
    };
  }
}
