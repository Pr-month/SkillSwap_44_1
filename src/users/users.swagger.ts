import { applyDecorators } from '@nestjs/common';

import { User } from './entities/user.entity';

import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

import { ApiOperation, ApiBearerAuth, ApiBody, ApiResponse, } from '@nestjs/swagger';


export function ApiUsersFindAll() {
    return applyDecorators(
        ApiOperation({ summary: "Get all users" }),
        ApiBearerAuth(),
        // успешный запрос
        ApiResponse({
            status: 200,
            description: 'List of all users',
            type: [User]
        }),
        // ошибка авторизации
        ApiResponse({
            status: 401,
            description: 'Unauthorized'
        })
    );
}

export function ApiUsersGetCurrentUser() {
    return applyDecorators(
        ApiOperation({ summary: "Get current user" }),
        ApiBearerAuth(),
        // успешный запрос
        ApiResponse({
            status: 200,
            description: 'Current user',
            type: User
        }),
        // ошибка авторизации
        ApiResponse({
            status: 401,
            description: 'Unauthorized'
        }),
        // Пользователь не найден
        ApiResponse({
            status: 404,
            description: 'User not found'
        })
    );

}

export function ApiUsersUpdateProfile() {
    return applyDecorators(
        ApiOperation({ summary: "Update profile data" }),
        ApiBearerAuth(),
        ApiBody({ type: UpdateProfileDto }),
        // успешный запрос
        ApiResponse({
            status: 200,
            description: 'User updated successfully',
            type: User
        }),
        // некорректные данные
        ApiResponse({
            status: 400,
            description: 'Bad Request',
        }),
        // ошибка авторизации
        ApiResponse({
            status: 401,
            description: 'Unauthorized'
        }),
        // Пользователь не найден
        ApiResponse({
            status: 404,
            description: 'User not found'
        })
    );

}

export function ApiUsersUpdatePassword() {
    return applyDecorators(
        ApiOperation({ summary: "Update current user password" }),
        ApiBearerAuth(),
        ApiBody({ type: UpdatePasswordDto }),
        // успешный запрос
        ApiResponse({
            status: 200,
            description: 'Password updated successfully',
            schema: {
                example: {
                    message: 'Пароль изменён',
                },
            },
        }),
        // ошибка авторизации
        ApiResponse({
            status: 401,
            description: 'Unauthorized or current password is incorrect'
        }),
        // некорректные данные
        ApiResponse({
            status: 400,
            description: 'Bad Request'
        }),
        ApiResponse({
            status: 404,
            description: 'User not found'
        })
    );

}