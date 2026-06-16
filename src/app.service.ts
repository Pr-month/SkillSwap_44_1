import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './users/entities/user.entity';
import { dbConfig, dbConfigType } from './common/config/db.config';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @Inject(dbConfig.KEY)
    private readonly dbConfig: dbConfigType,
  ) {}

  async getUsers() {
    console.log(this.dbConfig.host);
    return this.usersRepository.find();
  }
}