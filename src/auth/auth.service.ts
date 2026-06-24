import { appConfig, TAppConfig } from './../common/config/app.config';
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { RegisterRequestDto } from './dto/register-request.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { IJwtPayload, JwtExpiresIn } from './types/auth.types';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { jwtConfig, TJwtConfig } from '../common/config/jwt.config';
import { UserRepository } from '../users/users.repository';

@Injectable()
export class AuthService {
  constructor(
    // инжектим репозиторий для работы с бд
    // @InjectRepository(User)
    private readonly usersRepository: UserRepository,

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
    const user = await this.usersRepository.findByEmailWithPassword(email);
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
    const hashSaltRounds = this.appConfig.hashSaltRounds ?? 10;
    const refreshTokenHash = await bcrypt.hash(refreshToken, hashSaltRounds);

    await this.usersRepository.updateUser(user.id, { refreshTokenHash });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  // метод генерации токена
  private async generateTokens(payload: IJwtPayload) {
    // взял refreshTokenExpiresIn из appConfig
    const refreshTokenExpiresIn = (this.config.refreshTokenExpiresIn ??
      '7d') as JwtExpiresIn;

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
    const hashedPassword = await bcrypt.hash(
      registerRequestDto.password,
      saltRounds,
    );

      console.log(registerRequestDto);
      console.log(hashedPassword);

      // крафтим нового пользователя
      const savedUser = await this.usersRepository.createUser(
        registerRequestDto,
        hashedPassword,
      );

      console.log(savedUser);

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

      // записываем рефреш токен созданному пользователю
      const res = await this.usersRepository.updateUser(savedUser.id, {
        refreshTokenHash,
      });

      // формируем объект ответа
      const response: RegisterResponseDto = {
        user: savedUser,
        accessToken: accessToken,
        refreshToken,
      };

      // возвращаем объект ответа
      return response;
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
}
