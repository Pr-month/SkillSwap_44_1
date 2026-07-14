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
import { NotificationsGateway } from '../notification/notifications.gateway';
import {
  NotificationPayload,
  NotificationType,
} from '../notification/notification.types';
import { Requests } from './entities/request.entity';
import { Status } from './enum/status.enum';

@Injectable()
export class RequestsService {
  constructor(
    private readonly requestsRepository: RequestsRepository,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(createRequestDto: CreateRequestDto, user: IJwtPayload) {
    const { offeredSkillId, requestedSkillId } = createRequestDto;

    if (offeredSkillId === requestedSkillId) {
      throw new BadRequestException(
        'Offered and requested skills must be different',
      );
    }

    const result = await this.requestsRepository.createRequest({
      offeredSkillId,
      requestedSkillId,
      userId: user.sub,
    });

    if (result.request) {
      const request = await this.requestsRepository.findRequestWithDetails(
        result.request.id,
      );

      if (request) {
        this.notificationsGateway.notifyUser(
          request.receiver.id,
          this.createNewRequestNotification(request),
        );
      }
    }

    return result;
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
    const request = await this.requestsRepository.updateIncomingStatus(
      id,
      updateRequestDto.status,
      user.sub,
    );

    if (request) {
      this.notificationsGateway.notifyUser(
        request.sender.id,
        this.createStatusNotification(request),
      );
    }

    return request;
  }

  private createNewRequestNotification(request: Requests): NotificationPayload {
    return {
      type: NotificationType.NEW_REQUEST,
      message: `Поступила новая заявка от ${request.sender.name}`,
      requestId: request.id,
      skillTitle: request.requestedSkill.title,
      user: this.toNotificationUser(request.sender),
    };
  }

  private createStatusNotification(request: Requests): NotificationPayload {
    const isAccepted = request.status === Status.ACCEPTED;

    return {
      type: isAccepted
        ? NotificationType.REQUEST_ACCEPTED
        : NotificationType.REQUEST_REJECTED,
      message: isAccepted
        ? `Пользователь ${request.receiver.name} принял вашу заявку`
        : `Пользователь ${request.receiver.name} отклонил вашу заявку`,
      requestId: request.id,
      skillTitle: request.requestedSkill.title,
      user: this.toNotificationUser(request.receiver),
    };
  }

  private toNotificationUser(user: Requests['sender']) {
    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
    };
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
