import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserEntity } from '../user.entity';
import type { IJwtPayload, JwtExpiresIn } from './auth.types';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { jwtConfig, TJwtConfig } from '../common/config/jwt.config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
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
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await this.usersRepository.update(user.id, { refreshTokenHash });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  private async generateTokens(payload: IJwtPayload) {
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

  create(createAuthDto: CreateAuthDto) {
    void createAuthDto;

    return 'This action adds a new auth';
  }

  async refresh(_refreshToken: string) {
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
