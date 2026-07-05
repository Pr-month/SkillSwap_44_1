import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillsRepository extends Repository<Skill> {
  constructor(private readonly dataSource: DataSource) {
    super(Skill, dataSource.createEntityManager());
  }

  async findAllWithPagination(
    page = 1,
    limit = 20,
    search = '',
    category = '',
  ) {
    const queryBuilder = this.createQueryBuilder('skill')
      .leftJoinAndSelect('skill.category', 'category')
      .leftJoinAndSelect('category.parent', 'parent')
      .orderBy('skill.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const normalizedSearch = search.trim();
    const normalizedCategory = category.trim();

    if (normalizedSearch) {
      queryBuilder.andWhere(
        `(
          LOWER(skill.title) LIKE LOWER(:search)
          OR LOWER(category.name) LIKE LOWER(:search)
          OR LOWER(parent.name) LIKE LOWER(:search)
        )`,
        {
          search: `%${normalizedSearch}%`,
        },
      );
    }

    if (normalizedCategory) {
      queryBuilder.andWhere(
        `(
          LOWER(category.name) LIKE LOWER(:category)
          OR LOWER(parent.name) LIKE LOWER(:category)
        )`,
        {
          category: `%${normalizedCategory}%`,
        },
      );
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
    };
  }

  async createSkill(dto: CreateSkillDto, ownerId: string): Promise<Skill> {
    const skill = this.create({
      title: dto.title,
      description: dto.description ?? null,
      categoryId: dto.categoryId,
      ownerId,
      images: dto.images ?? [],
    });

    return this.save(skill);
  }

  async findById(id: number): Promise<Skill | null> {
    return this.createQueryBuilder('skill')
      .leftJoinAndSelect('skill.category', 'category')
      .leftJoinAndSelect('category.parent', 'parent')
      .where('skill.id = :id', { id })
      .getOne();
  }

  async updateSkill(id: number, dto: UpdateSkillDto): Promise<Skill | null> {
    const updateValues: Partial<Skill> = {};

    if (dto.title !== undefined) {
      updateValues.title = dto.title;
    }

    if (dto.description !== undefined) {
      updateValues.description = dto.description;
    }

    if (dto.categoryId !== undefined) {
      updateValues.categoryId = dto.categoryId;
    }

    if (dto.images !== undefined) {
      updateValues.images = dto.images;
    }

    await this.update(id, updateValues);

    return this.findById(id);
  }

  async deleteSkill(id: number): Promise<boolean> {
    const result = await this.delete(id);

    return Boolean(result.affected);
  }

  // метод для возврата похожих карточек 
  async findSimilarSkills(categoryId: number, skillId: number): Promise<Skill[]> {
    return this.createQueryBuilder('skill')
      // достаем данные о пользователе
      .leftJoinAndSelect('skill.owner', 'owner')
      // оставляем только с подходящей категорией
      .where(`skill.categoryId = :categoryId`, {categoryId})
      // исключаем из рекомендации исходный id
      .andWhere(`skill.id != :skillId`, {skillId})
      // ограничиваем выборку 10 значениями
      .take(10)
      // выполняем запрос
      .getMany();
  }
}
