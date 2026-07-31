import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { Requests } from './entities/request.entity';

export function ApiOutgoing() {
  return applyDecorators(
    ApiOperation({ summary: 'Get outgoing requests' }),

    ApiBearerAuth(),

    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),

    ApiResponse({
      status: 200,
      description: 'Successfully outgoing request',
      type: [Requests],
    }),
  );
}

export function ApiIncoming() {
  return applyDecorators(
    ApiOperation({ summary: 'Get incoming requests' }),

    ApiBearerAuth(),

    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),

    ApiResponse({
      status: 200,
      description: 'Successfully incoming request',
      type: [Requests],
    }),
  );
}

export function ApiDelete() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete request' }),

    ApiBearerAuth(),

    ApiParam({
      name: 'id',
      type: 'string',
      description: 'Request ID',
    }),

    ApiResponse({
      status: 200,
      description: 'Request deleted successfully',
      schema: {
        example: {
          message: 'Request is deleted',
          id: 'uuid',
        },
      },
    }),

    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),

    ApiResponse({
      status: 403,
      description: 'Forbidden',
    }),

    ApiResponse({
      status: 404,
      description: 'Request not found',
    }),
  );
}

export function ApiCreate() {
  return applyDecorators(
    ApiOperation({ summary: 'Create request' }),

    ApiBearerAuth(),

    ApiBody({
      type: CreateRequestDto,
    }),

    ApiResponse({
      status: 201,
      description: 'Request created successfully',
      schema: {
        example: {
          message: 'Request created',
          request: {
            id: 'uuid',
            status: 'PENDING',
            isRead: false,
          },
        },
      },
    }),

    ApiResponse({
      status: 400,
      description: 'Bad request',
    }),

    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),

    ApiResponse({
      status: 403,
      description: 'Forbidden',
    }),

    ApiResponse({
      status: 404,
      description: 'Skill not found',
    }),
  );
}

export function ApiUpdate() {
  return applyDecorators(
    ApiOperation({ summary: 'Update request' }),

    ApiBearerAuth(),

    ApiParam({
      name: 'id',
      type: 'string',
      description: 'Request ID',
    }),

    ApiBody({
      type: UpdateRequestDto,
    }),

    ApiResponse({
      status: 200,
      description: 'Request updated successfully',
      type: Requests,
    }),

    ApiResponse({
      status: 400,
      description: 'Bad request',
    }),

    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),

    ApiResponse({
      status: 403,
      description: 'Forbidden',
    }),

    ApiResponse({
      status: 404,
      description: 'Request not found',
    }),
  );
}
