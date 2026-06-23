import { UpdateProfileDto } from './dto/update-profile.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
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

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.updateUser(userId, updateProfileDto);

    const updatedUser = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }
}
