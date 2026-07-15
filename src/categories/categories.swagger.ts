import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

export function ApiCategoriesCreate() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new category' }),
    ApiBearerAuth(),
    ApiBody({ type: CreateCategoryDto }),
    ApiResponse({
      status: 201,
      description: 'Category created successfully',
      type: Category,
    }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiResponse({ status: 404, description: 'Parent category not found' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
  );
}

export function ApiCategoriesFindAll() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all categories' }),
    ApiResponse({
      status: 200,
      description: 'List of all categories',
      type: [Category],
    }),
  );
}

export function ApiCategoriesFindOne() {
  return applyDecorators(
    ApiOperation({ summary: 'Get category by ID' }),
    ApiParam({ name: 'id', type: 'number', description: 'Category ID' }),
    ApiResponse({
      status: 200,
      description: 'Category found',
      type: Category,
    }),
    ApiResponse({ status: 404, description: 'Category not found' }),
  );
}

export function ApiCategoriesUpdate() {
  return applyDecorators(
    ApiOperation({ summary: 'Update category' }),
    ApiBearerAuth(),
    ApiParam({ name: 'id', type: 'number', description: 'Category ID' }),
    ApiBody({ type: UpdateCategoryDto }),
    ApiResponse({
      status: 200,
      description: 'Category updated successfully',
      type: Category,
    }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Category not found' }),
  );
}

export function ApiCategoriesRemove() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete category' }),
    ApiBearerAuth(),
    ApiParam({ name: 'id', type: 'number', description: 'Category ID' }),
    ApiResponse({
      status: 200,
      description: 'Category deleted successfully',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Category not found' }),
  );
}
