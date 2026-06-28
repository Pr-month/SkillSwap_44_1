import { CreateCategoryDto } from './dto/create-category.dto';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesRepository extends Repository<Category> {
  constructor(private readonly dataSource: DataSource) {
    super(Category, dataSource.createEntityManager());
  }

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    const category = this.create({
      name: dto.name,
      parentId: dto.parentId ?? null,
    });

    return this.save(category);
  }
}
