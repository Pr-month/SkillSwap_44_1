import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterRequestDto } from './dto/register-request.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';

export function ApiAuthRegister() {
  return applyDecorators(
    ApiOperation({ summary: 'Register a new user' }),
    ApiBody({ type: RegisterRequestDto }),
    ApiResponse({
      status: 201,
      description: 'User registered successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request',
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict - User already exists',
    }),
  );
}

export function ApiAuthLogin() {
  return applyDecorators(
    ApiOperation({ summary: 'Login user' }),
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: 200,
      description: 'User logged in successfully',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid email or password',
    }),
  );
}

export function ApiAuthRefresh() {
  return applyDecorators(
    ApiOperation({ summary: 'Refresh access token' }),
    ApiResponse({
      status: 200,
      description: 'Tokens refreshed successfully',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid refresh token',
    }),
  );
}

export function ApiAuthLogout() {
  return applyDecorators(
    ApiOperation({ summary: 'Logout user' }),
    ApiBody({ type: LogoutDto }),
    ApiResponse({
      status: 200,
      description: 'User logged out successfully',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid refresh token',
    }),
  );
}
