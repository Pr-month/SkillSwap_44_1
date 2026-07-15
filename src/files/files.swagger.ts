import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

export function ApiUploadFile() {
  return applyDecorators(
    ApiOperation({
      summary: 'Upload image',
      description:
        'Uploads an image (jpg, jpeg, png, webp) up to 2 MB and returns its public URL.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: ['file'],
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'Image file (jpg, jpeg, png, webp, max 2 MB)',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'File uploaded successfully',
      schema: {
        example: {
          url: 'http://localhost:3000/public/uploads/1720102030-123456789.png',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Invalid file type',
    }),
    ApiResponse({
      status: 413,
      description: 'Payload Too Large - File exceeds 2 MB',
    }),
  );
}
