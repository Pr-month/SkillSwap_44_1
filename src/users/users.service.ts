import { Injectable, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './users.repository';
import { AppLoggerService } from '../logger/logger.service';

@Injectable()
export class UsersService {
  constructor(
    // @InjectRepository(User)
    private readonly usersRepository: UserRepository,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext(UsersService.name);
  }

  async findAll(): Promise<User[]> {
    this.logger.log('Fetching user');
    const res = await this.usersRepository.findAll();
    this.logger.log('Fetching user', {
      usersCount: res.length,
      userExample: res[1],
    });
    return res;
  }
}
