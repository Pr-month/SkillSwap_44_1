import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { City } from './entities/cities.entity';

export function ApiCitiesPost() {
  return applyDecorators(
    ApiOperation({ summary: 'Post a new city' }),
    ApiCreatedResponse({
      description: 'The city is created',
    }),
    ApiBearerAuth(),
  );
}

export function ApiCitiesGetAll() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a list of cities' }),
    ApiOkResponse({
      description: 'The cities list is received',
      type: [City],
    }),
  );
}

export function ApiCitiesGet() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a city by id' }),
    ApiOkResponse({
      description: 'The city is found by its id',
      type: City,
    }),
    ApiNotFoundResponse({
      description: 'City not found',
    }),
  );
}

export function ApiCitiesPatch() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a city by id' }),
    ApiOkResponse({
      description: 'City is updated by its id',
    }),
    ApiNotFoundResponse({
      description: 'City not found',
    }),
    ApiBearerAuth(),
  );
}

export function ApiCitiesDelete() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a city by id' }),
    ApiOkResponse({
      description: 'The city is deleted by its id',
    }),
    ApiNotFoundResponse({
      description: 'City not found',
    }),
    ApiBearerAuth(),
  );
}
