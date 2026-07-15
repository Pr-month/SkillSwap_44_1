import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Skill } from './entities/skill.entity';

export function ApiSkillsGetFindAll() {
  return applyDecorators(
    ApiOperation({ summary: 'Returns the list of the skills' }),
    ApiOkResponse({
      description: 'A list of skills is received',
    }),
    ApiNotFoundResponse({
      description: 'Page not found',
    }),
  );
}

export function ApiSkillsGetFindSimilar() {
  return applyDecorators(
    ApiOperation({ summary: 'Returns the list of similar skills' }),
    ApiOkResponse({
      description: 'A list of similar skills is received',
      type: [Skill],
    }),
    ApiNotFoundResponse({
      description: 'Skill not found',
    }),
  );
}

export function ApiSkillsPost() {
  return applyDecorators(
    ApiOperation({ summary: 'Creates a new skill' }),
    ApiCreatedResponse({
      description: 'A new skill is created',
      type: Skill,
    }),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

export function ApiSkillsPostFavorite() {
  return applyDecorators(
    ApiOperation({ summary: 'Adds to favorites' }),
    ApiOkResponse({
     description: 'The skill is added to favorites',
    }),
    ApiNotFoundResponse({
      description: 'Skill or user not found',
    }),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

export function ApiSkillsUpdate() {
  return applyDecorators(
    ApiOperation({ summary: 'Updates the skill' }),
    ApiOkResponse({
      description: 'The skill is updated',
      type: Skill,
    }),
    ApiNotFoundResponse({
      description: 'Skill not found',
    }),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
    ApiForbiddenResponse({
      description: 'Insufficient permissions',
    }),
  );
}

export function ApiSkillsDelete() {
  return applyDecorators(
    ApiOperation({ summary: 'Removes the skill' }),
    ApiOkResponse({
      description: 'The skill is deleted',
        schema: {
        example: {
          success: true,
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Skill not found',
    }),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
    ApiForbiddenResponse({
      description: 'Insufficient permissions',
    }),
  );
}

export function ApiSkillsDeleteFavorite() {
  return applyDecorators(
    ApiOperation({ summary: 'Removes a skill from favorites' }),
    ApiOkResponse({
      description: 'The skill is removed from favorites',
    }),
    ApiNotFoundResponse({
      description: 'Skill or user not found',
    }),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}
