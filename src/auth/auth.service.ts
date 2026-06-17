import { appConfig, TAppConfig } from './../common/config/app.config';
import { ConflictException, Injectable, Inject } from '@nestjs/common';
import { RegisterRequestDto } from './dto/register-request.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import * as bcrypt from "bcrypt"
import { RegisterResponseDto } from './dto/register-response.dto';
import { Repository, QueryFailedError } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {

  constructor(
    // инжектим репозиторий для работы с бд
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    // внедряем сервис конфигурации
    @Inject(appConfig.KEY)
    private readonly appConfig: TAppConfig
  ) { }

  async register(registerRequestDto: RegisterRequestDto) {
    // достаем соль из .env
    const saltRounds = this.appConfig.hashSalt || 10;

    // хешируем пароль с солью 10
    const hashedPassword = await bcrypt.hash(registerRequestDto.password, Number(saltRounds));


    // копируем все поля полученные с фронта, меняем пароль на хеш
    const newUser = this.usersRepository.create({
      ...registerRequestDto,
      passwordHash: hashedPassword,
      birthdate: new Date(registerRequestDto.birthdate),
      // favouriteSkills: registerRequestDto.favouriteSkills ?? [],
      // skills: registerRequestDto.skills ?? [],
      wantToLearn: registerRequestDto.wantToLearn ?? [],
      // указываем по дефолту роль пользователя
      roleId: 2
    });


    try {
      // пытаемся запушить пользователя в бд
      const savedUser = await this.usersRepository.save(newUser);

      // формируем объект ответа
      const response = {
        ...savedUser
      }

      // возвращаем запушенное значение 
      return response;

    } catch (error) {

      // показываем ошибку
      console.log(error);

      // проверяем ошибка возникла из-за дубликата?
      if (error instanceof QueryFailedError) {
        // достаем оригинальный объект ошибки
        const errorDriver = error.driverError;

        // проверяем код ошибки
        if (errorDriver && (errorDriver.code === '23505')) {
          throw new ConflictException('Пользователь с такой почтой уже зарегистрирован');
        }
      }

      // если ошибка по другой причине
      throw error;
    }


  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    void updateAuthDto;

    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
