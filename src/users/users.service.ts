import { Injectable, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    // @InjectRepository(User)
    private readonly usersRepository: UserRepository,
  ) {}

  async findAll(): Promise<User[]> {
    const res = await this.usersRepository.findAll();

    return res;
  }
}
