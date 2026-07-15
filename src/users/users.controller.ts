import {
  Controller,
  Get,
  UseGuards,
  Request,
  NotFoundException,
  Patch,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { AuthenticatedRequest } from '../auth/types/auth.types';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@Request() req: AuthenticatedRequest) {
    const user = await this.usersService.findById(req.user.sub);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const user = await this.usersService.updateProfile(
      req.user.sub,
      updateProfileDto,
    );

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  async updatePassword(
    @Request() req: AuthenticatedRequest,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.usersService.updatePassword(req.user.sub, updatePasswordDto);

    return { message: 'Пароль изменён' };
  }
}
