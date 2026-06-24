import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequestDto } from './dto/register-request.dto';
import { LoginDto } from './dto/login.dto';
import { AppLoggerService } from '../logger/logger.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext(AuthController.name);
  }

  @Post('register')
  register(@Body() registerRequestDto: RegisterRequestDto) {
    return this.authService.register(registerRequestDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body('token') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    return this.authService.refresh(refreshToken);
  }
}
