import { appConfig, TAppConfig } from './../common/config/app.config';
import { ConflictException, Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { RegisterRequestDto } from './dto/register-request.dto';

// было: теперь использую Inject appConfig
// import { ConfigService } from '@nestjs/config';

import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

// было:
// import { UserEntity } from '../user.entity';
// стало
import { User } from '../users/entities/user.entity';

import type { IJwtPayload, JwtExpiresIn } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Repository, QueryFailedError } from 'typeorm';
import { RegisterResponseDto } from './dto/register-response.dto';
import { jwtConfig, TJwtConfig } from '../common/config/jwt.config';

@Injectable()
export class AuthService {
  constructor(
    // инжектим репозиторий для работы с бд
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    // инжектим сервис конфигурации
    @Inject(appConfig.KEY)
    private readonly appConfig: TAppConfig,

    // внедряем jwtService
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly config: TJwtConfig,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const email = loginDto.email.trim().toLowerCase();
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('LOWER(user.email) = :email', { email })
      .getOne();

    const isPasswordValid =
      user && (await bcrypt.compare(loginDto.password, user.passwordHash));

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: IJwtPayload = {
      sub: String(user.id),
      email: user.email,
      roleId: user.roleId,
    };

    const { accessToken, refreshToken } = await this.generateTokens(payload);
    const hashSaltRounds =
      this.appConfig.hashSaltRounds ?? 10;
    const refreshTokenHash = await bcrypt.hash(refreshToken, hashSaltRounds);

    await this.usersRepository.update(user.id, { refreshTokenHash });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  // метод генерации токена
  private async generateTokens(payload: IJwtPayload) {

    // было:
    // const refreshTokenExpiresIn = (this.configService.get<string>(
    //   'JWT_REFRESH_EXPIRES_IN',
    // ) ?? '7d') as JwtExpiresIn;

    // взял refreshTokenExpiresIn из appConfig
    const refreshTokenExpiresIn = (this.appConfig.jwt_refresh_expires_in ?? '7d') as JwtExpiresIn;



    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        expiresIn: refreshTokenExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  // метод для регистрации
  async register(registerRequestDto: RegisterRequestDto) {
    // достаем соль из .env
    const saltRounds = this.appConfig.hashSaltRounds || 10;

    // хешируем пароль с солью 10
    const hashedPassword = await bcrypt.hash(registerRequestDto.password, saltRounds);


    // копируем поля полученные с фронта, меняем пароль на хеш
    const newUser = this.usersRepository.create({
      ...registerRequestDto,
      passwordHash: hashedPassword,
      birthdate: new Date(registerRequestDto.birthdate),
      wantToLearn: registerRequestDto.wantToLearn ?? [],

      // указываем по дефолту роль пользователя
      roleId: 2
    });


    try {
      // пытаемся запушить пользователя в бд
      const savedUser = await this.usersRepository.save(newUser);

      // формируем payload
      const payload: IJwtPayload = {
        sub: String(savedUser.id),
        email: savedUser.email,
        roleId: savedUser.roleId,
      };

      // получаем токены
      const { accessToken, refreshToken } = await this.generateTokens(payload);

      // хешируем рефреш токен
      const refreshTokenHash = await bcrypt.hash(
        refreshToken,
        this.appConfig.hashSaltRounds,
      );

      // записываем рефреш токен в бд
      await this.usersRepository.update(
        savedUser.id,
        { refreshTokenHash },
      );
      
      // формируем объект ответа
      const response: RegisterResponseDto = {
        user: savedUser,
        accessToken: accessToken,
        refreshToken
      }

      // возвращаем объект ответа
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

      // если ошибка по другой причине передаем ее дальше
      throw error;
    }


  }

  // метод обновления токена
  async refresh(refreshToken: string) {
    try {
      // TODO: после создания стратегии верифицировать токен и создать новую пару токенов

      return {
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      };
    } catch (error) {
      throw new UnauthorizedException();
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
