import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { RegisterRequestDto } from './dto/register-request.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import * as bcrypt from "bcrypt"
import { RegisterResponseDto } from './dto/register-response.dto';
import { Repository, QueryFailedError } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {

  constructor(
    // инжектим репозиторий для работы с бд
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    // внедряем сервис конфигурации
    private readonly configService: ConfigService
  ) { }

  async register(registerRequestDto: RegisterRequestDto) {
    // достаем соль из .env
    const saltRounds = this.configService.get<number>('SALT_ROUNDS', 10);

    // хешируем пароль с солью 10
    const hashedPassword = await bcrypt.hash(registerRequestDto.password, Number(saltRounds));


    // копируем все поля полученные с фронта, меняем пароль на хеш
    const newUser = this.usersRepository.create({
      ...registerRequestDto,
      passwordHash: hashedPassword,
      birthdate: new Date(registerRequestDto.birthdate),
      favouriteSkills: registerRequestDto.favouriteSkills ?? [],
      skills: registerRequestDto.skills ?? [],
      wantToLearn: registerRequestDto.wantToLearn ?? [],
      // указываем по дефолту роль пользователя
      roleId: 2
    });


    try {
      // пытаемся запушить пользователя в бд
      const savedUser = await this.usersRepository.save(newUser);

      // формируем объект ответа
      const response: RegisterResponseDto = {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        gender: savedUser.gender,
        city: savedUser.city,
        birthdate: savedUser.birthdate,
        about: savedUser.about ?? undefined,
        avatar: savedUser.avatar ?? undefined,
        wantToLearn: savedUser.wantToLearn,
        skills: savedUser.skills,
        favouriteSkills: savedUser.favouriteSkills,
        roleId: String(savedUser.roleId),
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
      throw new InternalServerErrorException('При регистрации возникла ошибка');
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
