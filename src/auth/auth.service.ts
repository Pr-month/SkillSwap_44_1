import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {
  create(createAuthDto: CreateAuthDto) {
    void createAuthDto;

    return 'This action adds a new auth';
  }

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
