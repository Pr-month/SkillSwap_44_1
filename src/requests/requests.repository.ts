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

}
