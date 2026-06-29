import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesRepository } from './categories.repository';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}
  create(createCategoryDto: CreateCategoryDto) {
    return 'This action adds a new category';
  }

  findAll() {
    return `This action returns all categories`;
  }

  async findOne(id: number): Promise<Category | null> {
    return this.categoriesRepository.findByIdWithRelations(id);
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Категория ${id} не найдена`);
    }

    if (updateCategoryDto.parentId !== undefined) {
      const parent = await this.categoriesRepository.findById(
        updateCategoryDto.parentId,
      );
      if (!parent) {
        throw new NotFoundException(
          `Родительская категория ${updateCategoryDto.parentId} не найдена`,
        );
      }
    }

    const updatedCategory = await this.categoriesRepository.updateCategory(
      id,
      updateCategoryDto,
    );
    if (!updatedCategory) {
      throw new NotFoundException(`Категория ${id} не найдена`);
    }

    return updatedCategory;
  }

  async remove(id: number): Promise<{ message: string }> {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundException(`Категория ${id} не найдена`);
    }

    await this.categoriesRepository.deleteCategory(id);

    return { message: 'Категория успешно удалена' };
  }
}
