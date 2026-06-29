import { DataSource, Repository } from "typeorm";
import { Requests } from "./entities/request.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RequestsRepository extends Repository<Requests> {
  constructor(private readonly dataSource: DataSource) {
    super(Requests, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<Requests | null> {
    return this.findOne({ 
        where: { id },
        relations: { sender: true, },
     });
  }
  
    async getOutgoingRequests(userId: string) {
        return this.createQueryBuilder('request')
        .leftJoin('request.sender', 'sender')
        .leftJoin('request.receiver', 'receiver')
        .leftJoin('request.offeredSkill', 'offeredSkill')
        .leftJoin('request.requestedSkill', 'requestedSkill')
        .select([
            'request.id',
            'request.status',
            'request.isRead',

            'sender.id',
            'sender.name',
            'sender.avatar',

            'receiver.id',
            'receiver.name',
            'receiver.avatar',

            'offeredSkill.id',
            'offeredSkill.title',

            'requestedSkill.id',
            'requestedSkill.title',
        ])
        .where('sender.id = :userId', { userId })
        .orderBy('request.createdAt', 'DESC')
        .getMany();
    }

}
