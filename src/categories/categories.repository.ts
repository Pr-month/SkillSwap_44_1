import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesRepository extends Repository<Category> {
  constructor(private readonly dataSource: DataSource) {
    super(Category, dataSource.createEntityManager());
  }

  async findById(id: number): Promise<Category | null> {
    return this.findOne({
      where: { id },
    });
  }

  async findByIdWithRelations(id: number): Promise<Category | null> {
    return this.findOne({
      where: { id },
      relations: {
        parent: true,
        children: true,
      },
    });
  }

  async updateCategory(
    id: number,
    dto: UpdateCategoryDto,
  ): Promise<Category | null> {
    const updateValues: Partial<Category> = {};

    if (dto.name !== undefined) {
      updateValues.name = dto.name;
    }

    if (dto.parentId !== undefined) {
      updateValues.parentId = dto.parentId;
    }

    await this.update(id, updateValues);
    return this.findById(id);
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await this.delete(id);
    return Boolean(result.affected);
  }
}
