import { DataSource, EntityManager, Repository } from 'typeorm';
import { Requests } from './entities/request.entity';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Skill } from '../skills/entities/skill.entity';
import { Status } from './enum/status.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RequestsRepository extends Repository<Requests> {
  constructor(private readonly dataSource: DataSource) {
    super(Requests, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<Requests | null> {
    return this.findOne({
      where: { id },
      relations: { sender: true },
    });
  }

  async getOutgoingRequests(userId: string) {
    return this.find({
      where: {
        sender: {
          id: userId,
        },
      },
      relations: {
        sender: true,
        receiver: true,
        offeredSkill: true,
        requestedSkill: true,
      },
      select: {
        id: true,
        status: true,
        isRead: true,

        sender: {
          id: true,
          name: true,
          avatar: true,
        },

        receiver: {
          id: true,
          name: true,
          avatar: true,
        },

        offeredSkill: {
          id: true,
          title: true,
        },

        requestedSkill: {
          id: true,
          title: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getIncomingRequests(userId: string) {
    return this.find({
      where: [
        {
          receiver: {
            id: userId,
          },
          status: Status.PENDING,
        },
        {
          receiver: {
            id: userId,
          },
          status: Status.INPROGRESS,
        },
      ],
      relations: {
        sender: true,
        receiver: true,
        offeredSkill: true,
        requestedSkill: true,
      },
      select: {
        id: true,
        status: true,
        isRead: true,

        sender: {
          id: true,
          name: true,
          avatar: true,
        },

        receiver: {
          id: true,
          name: true,
          avatar: true,
        },

        offeredSkill: {
          id: true,
          title: true,
        },

        requestedSkill: {
          id: true,
          title: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async updateIncomingStatus(
    id: string,
    status: Status,
    receiverId: string,
  ): Promise<Requests | null> {
    await this.dataSource.transaction(async (manager) => {
      const request = await manager.findOne(Requests, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!request) {
        throw new NotFoundException(`Заявка с id ${id} не найдена`);
      }

      if (String(request.receiverId) !== String(receiverId)) {
        throw new ForbiddenException('Можно обновить только входящую заявку');
      }

      const activeStatuses: Status[] = [Status.PENDING, Status.INPROGRESS];

      if (!activeStatuses.includes(request.status)) {
        throw new BadRequestException(
          'Можно обновить только актуальную заявку',
        );
      }

      if (status === Status.ACCEPTED) {
        await this.addExchangeSkillsToUsers(manager, [
          {
            userId: request.receiverId,
            skillId: request.offeredSkillId,
          },
          {
            userId: request.senderId,
            skillId: request.requestedSkillId,
          },
        ]);
      }

      await manager.update(Requests, id, {
        status,
        isRead: true,
      });
    });

    return this.findRequestWithDetails(id);
  }

  async findRequestWithDetails(id: string): Promise<Requests | null> {
    return this.findOne({
      where: { id },
      relations: {
        sender: true,
        receiver: true,
        offeredSkill: true,
        requestedSkill: true,
      },
      select: {
        id: true,
        status: true,
        isRead: true,

        sender: {
          id: true,
          name: true,
          avatar: true,
        },

        receiver: {
          id: true,
          name: true,
          avatar: true,
        },

        offeredSkill: {
          id: true,
          title: true,
        },

        requestedSkill: {
          id: true,
          title: true,
        },
      },
    });
  }

  private async addExchangeSkillsToUsers(
    manager: EntityManager,
    exchanges: { userId: string; skillId: string }[],
  ) {
    const sortedExchanges = [...exchanges].sort((first, second) =>
      String(first.userId).localeCompare(String(second.userId)),
    );

    for (const exchange of sortedExchanges) {
      const user = await manager.findOne(User, {
        where: { id: exchange.userId },
        select: {
          id: true,
          skills: true,
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) {
        throw new NotFoundException(
          `Пользователь с id ${exchange.userId} не найден`,
        );
      }

      const currentSkills = user.skills ?? [];
      const exchangeSkillId = String(exchange.skillId);

      if (currentSkills.includes(exchangeSkillId)) {
        continue;
      }

      await manager.update(User, exchange.userId, {
        skills: [...currentSkills, exchangeSkillId],
      });
    }
  }

  async createRequest(data: {
    offeredSkillId: string;
    requestedSkillId: string;
    userId: string;
  }) {
    const skillRepository = this.dataSource.getRepository(Skill);

    const offeredSkillId = String(data.offeredSkillId);
    const requestedSkillId = String(data.requestedSkillId);
    const userId = String(data.userId);

    if (offeredSkillId === requestedSkillId) {
      throw new BadRequestException('You cannot request the same skill');
    }

    const offeredSkill = await skillRepository.findOne({
      where: { id: Number(offeredSkillId) },
    });

    if (!offeredSkill) {
      throw new NotFoundException(
        `Offered skill with id ${offeredSkillId} not found`,
      );
    }

    const requestedSkill = await skillRepository.findOne({
      where: { id: Number(requestedSkillId) },
    });

    if (!requestedSkill) {
      throw new NotFoundException(
        `Requested skill with id ${requestedSkillId} not found`,
      );
    }

    if (offeredSkill.ownerId !== userId) {
      throw new ForbiddenException('You can offer only your own skill');
    }

    if (requestedSkill.ownerId === userId) {
      throw new BadRequestException('You cannot request your own skill');
    }

    const existingRequest = await this.findOne({
      where: {
        senderId: userId,
        receiverId: requestedSkill.ownerId,
        offeredSkillId,
        requestedSkillId,
        status: Status.PENDING,
      },
    });

    if (existingRequest) {
      throw new BadRequestException('Request already exists');
    }

    const request = this.create({
      senderId: userId,
      receiverId: requestedSkill.ownerId,
      offeredSkillId,
      requestedSkillId,
      status: Status.PENDING,
      isRead: false,
    });

    const savedRequest = await this.save(request);

    const createdRequest = await this.findOne({
      where: { id: savedRequest.id },
      select: {
        id: true,
        status: true,
        isRead: true,
      },
    });

    return {
      message: 'Request created',
      request: createdRequest,
    };
  }
}
