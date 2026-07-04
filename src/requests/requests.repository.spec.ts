import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { RequestsRepository } from './requests.repository';
import { Requests } from './entities/request.entity';
import { Status } from './enum/status.enum';
import { User } from '../users/entities/user.entity';

describe('RequestsRepository', () => {
  let repository: RequestsRepository;
  let dataSource: {
    createEntityManager: jest.Mock;
    transaction: jest.Mock;
  };

  beforeEach(() => {
    dataSource = {
      createEntityManager: jest.fn(),
      transaction: jest.fn(),
    };

    repository = new RequestsRepository(dataSource as unknown as DataSource);
  });

  it('должен возвращать актуальные входящие заявки получателя', async () => {
    const incomingRequests = [
      {
        id: '1',
        status: Status.PENDING,
        isRead: false,
      },
    ] as Requests[];

    const findMock = jest.fn().mockResolvedValue(incomingRequests);

    repository.find = findMock;

    await expect(repository.getIncomingRequests('2')).resolves.toBe(
      incomingRequests,
    );
    expect(findMock).toHaveBeenCalledWith({
      where: [
        {
          receiver: {
            id: '2',
          },
          status: Status.PENDING,
        },
        {
          receiver: {
            id: '2',
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
  });

  it('должен принимать заявку под блокировкой и добавлять обмениваемые навыки пользователям', async () => {
    const request = {
      id: '1',
      senderId: '2',
      receiverId: '3',
      offeredSkillId: '10',
      requestedSkillId: '20',
      status: Status.PENDING,
    } as Requests;
    const updatedRequest = {
      id: '1',
      status: Status.ACCEPTED,
      isRead: true,
    } as Requests;
    const managerMock = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce(request)
        .mockResolvedValueOnce({ id: '2', skills: [] })
        .mockResolvedValueOnce({ id: '3', skills: ['5'] }),
      update: jest.fn().mockResolvedValue(undefined),
    };
    const findOneMock = jest.fn().mockResolvedValue(updatedRequest);

    dataSource.transaction.mockImplementation(
      async (callback: (manager: EntityManager) => Promise<void>) =>
        callback(managerMock as unknown as EntityManager),
    );
    repository.findOne = findOneMock;

    await expect(
      repository.updateIncomingStatus('1', Status.ACCEPTED, '3'),
    ).resolves.toBe(updatedRequest);
    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(managerMock.findOne).toHaveBeenNthCalledWith(1, Requests, {
      where: { id: '1' },
      lock: { mode: 'pessimistic_write' },
    });
    expect(managerMock.findOne).toHaveBeenNthCalledWith(2, User, {
      where: { id: '2' },
      select: {
        id: true,
        skills: true,
      },
      lock: { mode: 'pessimistic_write' },
    });
    expect(managerMock.findOne).toHaveBeenNthCalledWith(3, User, {
      where: { id: '3' },
      select: {
        id: true,
        skills: true,
      },
      lock: { mode: 'pessimistic_write' },
    });
    expect(managerMock.update).toHaveBeenNthCalledWith(1, User, '2', {
      skills: ['20'],
    });
    expect(managerMock.update).toHaveBeenNthCalledWith(2, User, '3', {
      skills: ['5', '10'],
    });
    expect(managerMock.update).toHaveBeenNthCalledWith(3, Requests, '1', {
      status: Status.ACCEPTED,
      isRead: true,
    });
    expect(findOneMock).toHaveBeenCalledWith({
      where: { id: '1' },
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
  });

  it('должен отклонять заявку под блокировкой без обмена навыками', async () => {
    const request = {
      id: '1',
      senderId: '3',
      receiverId: '2',
      offeredSkillId: '10',
      requestedSkillId: '20',
      status: Status.PENDING,
    } as Requests;
    const updatedRequest = {
      id: '1',
      status: Status.REJECTED,
      isRead: true,
    } as Requests;
    const managerMock = {
      findOne: jest.fn().mockResolvedValueOnce(request),
      update: jest.fn().mockResolvedValue(undefined),
    };

    dataSource.transaction.mockImplementation(
      async (callback: (manager: EntityManager) => Promise<void>) =>
        callback(managerMock as unknown as EntityManager),
    );
    repository.findOne = jest.fn().mockResolvedValue(updatedRequest);

    await expect(
      repository.updateIncomingStatus('1', Status.REJECTED, '2'),
    ).resolves.toBe(updatedRequest);
    expect(managerMock.findOne).toHaveBeenCalledTimes(1);
    expect(managerMock.update).toHaveBeenCalledTimes(1);
    expect(managerMock.update).toHaveBeenCalledWith(Requests, '1', {
      status: Status.REJECTED,
      isRead: true,
    });
  });

  it('должен возвращать ошибку, если заявка не найдена внутри транзакции', async () => {
    const managerMock = {
      findOne: jest.fn().mockResolvedValueOnce(null),
      update: jest.fn(),
    };

    dataSource.transaction.mockImplementation(
      async (callback: (manager: EntityManager) => Promise<void>) =>
        callback(managerMock as unknown as EntityManager),
    );

    await expect(
      repository.updateIncomingStatus('1', Status.REJECTED, '2'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(managerMock.update).not.toHaveBeenCalled();
  });

  it('должен запрещать обновление не входящей заявки внутри транзакции', async () => {
    const request = {
      id: '1',
      receiverId: '3',
      status: Status.PENDING,
    } as Requests;
    const managerMock = {
      findOne: jest.fn().mockResolvedValueOnce(request),
      update: jest.fn(),
    };

    dataSource.transaction.mockImplementation(
      async (callback: (manager: EntityManager) => Promise<void>) =>
        callback(managerMock as unknown as EntityManager),
    );

    await expect(
      repository.updateIncomingStatus('1', Status.REJECTED, '2'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(managerMock.update).not.toHaveBeenCalled();
  });

  it('должен запрещать обновление неактуальной заявки внутри транзакции', async () => {
    const request = {
      id: '1',
      receiverId: '2',
      status: Status.ACCEPTED,
    } as Requests;
    const managerMock = {
      findOne: jest.fn().mockResolvedValueOnce(request),
      update: jest.fn(),
    };

    dataSource.transaction.mockImplementation(
      async (callback: (manager: EntityManager) => Promise<void>) =>
        callback(managerMock as unknown as EntityManager),
    );

    await expect(
      repository.updateIncomingStatus('1', Status.REJECTED, '2'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(managerMock.update).not.toHaveBeenCalled();
  });
});
