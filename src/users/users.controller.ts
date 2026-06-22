import {
  Controller,
  Get,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from './types/requestWithUser.type';

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
  async getCurrentUser(@Request() req: RequestWithUser) {
    const user = await this.usersService.findById(req.user.id);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }
}
