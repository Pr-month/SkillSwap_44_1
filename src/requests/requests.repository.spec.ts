import { DataSource } from 'typeorm';
import { RequestsRepository } from './requests.repository';
import { Requests } from './entities/request.entity';
import { Status } from './enum/status.enum';

describe('RequestsRepository', () => {
  let repository: RequestsRepository;

  beforeEach(() => {
    const dataSource = {
      createEntityManager: jest.fn(),
    } as unknown as DataSource;

    repository = new RequestsRepository(dataSource);
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
});
