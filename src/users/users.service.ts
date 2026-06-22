import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UserRepository) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }
}
