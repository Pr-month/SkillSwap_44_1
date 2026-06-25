import { RegisterRequestDto } from './../auth/dto/register-request.dto';
import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { UserRole } from './users.enums';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findAll() {
    return this.find();
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('LOWER(user.email) = :email', { email: email.toLowerCase() })
      .getOne();
  }

  async createUser(
    registerRequestDto: RegisterRequestDto,
    hashedPassword: string,
  ) {
    const newUser = this.create({
      ...registerRequestDto,
      passwordHash: hashedPassword,
      birthdate: new Date(registerRequestDto.birthdate),
      wantToLearn: registerRequestDto.wantToLearn ?? [],

      // указываем по дефолту роль пользователя
      roleId: UserRole.USER,
    });

    const savedUser = await this.save(newUser);

    console.log(savedUser);

    return savedUser;
  }

  async updateUser(userId: string, values: Partial<User>) {
    const res = await this.update(userId, { ...values });
    return res;
  }
}
