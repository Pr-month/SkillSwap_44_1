import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    let status: HttpStatus;
    let message: string;

    console.log(exception)
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    switch (true) {
      // 404 - сущность не найдена
      case exception instanceof Error &&
        exception.name === 'EntityNotFoundError':
        status = HttpStatus.NOT_FOUND;
        message = 'Entity not found';
        break;

      // 409 - ошибка дубликата
      case exception instanceof Error &&
        'driverError' in exception &&
        (exception as any).driverError?.code === '23505':
        status = HttpStatus.CONFLICT;
        message = 'Email already exists';
        break;

      // 413 - слишком большой файл
      case exception instanceof Error &&
        exception.constructor.name === 'PayloadTooLargeException':
        status = HttpStatus.PAYLOAD_TOO_LARGE;
        message = 'Payload is too large';
        break;

      // Http errors
      case exception instanceof HttpException:
        status = exception.getStatus();
        message = exception.message;
        break;

      // 500 - внутренние ошибки сервера
      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Internal server error';
    }

    response.status(status).json({
      error: {
        status: status,
        message: message,
        method: request.method,
        url: request.url,
      },
    });
  }
}
