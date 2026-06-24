import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './users.repository';
import { AppLoggerService } from '../logger/logger.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { appConfig, TAppConfig } from '../common/config/app.config';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly logger: AppLoggerService,
    @Inject(appConfig.KEY)
    private readonly config: TAppConfig,
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

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.usersRepository.updateUser(userId, updateProfileDto);

    const updatedUser = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!updatedUser) {
      throw new NotFoundException('Пользователь не найден');
    }

    return updatedUser;
  }

  async updatePassword(
    userId: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isPasswordValid = await bcrypt.compare(
      updatePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный пароль');
    }

    const saltRounds = this.config.hashSaltRounds || 10;
    const newPasswordHash = await bcrypt.hash(
      updatePasswordDto.newPassword,
      saltRounds,
    );

    await this.usersRepository.updateUser(userId, {
      passwordHash: newPasswordHash,
    });
  }
}
