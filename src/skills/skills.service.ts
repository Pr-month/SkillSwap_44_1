import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { join, basename } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { SkillsRepository } from './skills.repository';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { GetSkillsQueryDto } from './dto/get-skills.dto';
import { UserRepository } from '../users/users.repository';

@Injectable()
export class SkillsService {
  constructor(
    private readonly skillsRepository: SkillsRepository,
    private readonly usersRepository: UserRepository,
  ) {}

  async findAll(query: GetSkillsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const { data, total } = await this.skillsRepository.findAllWithPagination(
      page,
      limit,
      query.search ?? '',
      query.category ?? '',
    );

    const totalPages = Math.max(1, Math.ceil(total / limit));

    if (page > totalPages) {
      throw new NotFoundException(
        `Page ${page} not found. Total pages: ${totalPages}`,
      );
    }

    return {
      data,
      page,
      totalPages,
    };
  }

  async create(createSkillDto: CreateSkillDto, ownerId: string) {
    return this.skillsRepository.createSkill(createSkillDto, ownerId);
  }

  async update(id: number, updateSkillDto: UpdateSkillDto, userId: string) {
    const skill = await this.skillsRepository.findById(id);

    if (!skill) {
      throw new NotFoundException(`Skill with id ${id} not found`);
    }

    if (skill.ownerId !== userId) {
      throw new ForbiddenException('Недостаточно прав');
    }

    return this.skillsRepository.updateSkill(id, updateSkillDto);
  }

  async delete(id: number, userId: string) {
    const skill = await this.skillsRepository.findById(id);

    if (!skill) {
      throw new NotFoundException(`Skill with id ${id} not found`);
    }

    if (skill.ownerId !== userId) {
      throw new ForbiddenException('Недостаточно прав');
    }

    this.deleteSkillImages(skill.images);

    await this.skillsRepository.deleteSkill(id);

    return {
      success: true,
    };
  }

  async addToFavorites(id: number, userId: string) {
    const skill = await this.skillsRepository.findById(id);

    if (!skill) {
      throw new NotFoundException(`Skill with id ${id} not found`);
    }

    const favouriteSkills = await this.usersRepository.addFavouriteSkill(
      userId,
      id,
    );

    if (!favouriteSkills) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return {
      favouriteSkills,
    };
  }

  async removeFromFavorites(id: number, userId: string) {
    const skill = await this.skillsRepository.findById(id);

    if (!skill) {
      throw new NotFoundException(`Skill with id ${id} not found`);
    }

    const favouriteSkills = await this.usersRepository.removeFavouriteSkill(
      userId,
      id,
    );

    if (!favouriteSkills) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return {
      favouriteSkills,
    };
  }

  private deleteSkillImages(images: string[] | null) {
    if (!images || images.length === 0) {
      return;
    }

    for (const image of images) {
      const fileName = basename(image);

      const filePath = join(process.cwd(), 'public', 'uploads', fileName);

      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    }
  }

  // метод для получения похожих карточек
  async findSimilar(skillId: number) {
    // пытаемся найти скилл по переданному id
    const skill = await this.skillsRepository.findById(skillId);

    // если не нашли - выкидываем ошибку
    if (!skill) {
      throw new NotFoundException(`Skill with id ${skillId} not found `);
    }

    // если нашли - передаем в репозиторий категорию и айди скилла и возвращаем результат
    return this.skillsRepository.findSimilarSkills(skill.categoryId, skillId);
  }
}
