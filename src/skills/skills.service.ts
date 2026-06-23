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

@Injectable()
export class SkillsService {
  constructor(private readonly skillsRepository: SkillsRepository) {}

  async findAll(page = 1, limit = 20, search = '', category = '') {
    const { data, total } = await this.skillsRepository.findAllWithPagination(
      page,
      limit,
      search,
      category,
    );

    const totalPages = Math.ceil(total / limit);

    if (totalPages > 0 && page > totalPages) {
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

  async create(createSkillDto: CreateSkillDto, ownerId: number) {
    return this.skillsRepository.createSkill(createSkillDto, ownerId);
  }

  async update(id: number, updateSkillDto: UpdateSkillDto, userId: number) {
    const skill = await this.skillsRepository.findById(id);

    if (!skill) {
      throw new NotFoundException(`Skill with id ${id} not found`);
    }

    if (Number(skill.ownerId) !== Number(userId)) {
      throw new ForbiddenException('Недостаточно прав');
    }

    return this.skillsRepository.updateSkill(id, updateSkillDto);
  }

  async delete(id: number, userId: number) {
    const skill = await this.skillsRepository.findById(id);

    if (!skill) {
      throw new NotFoundException(`Skill with id ${id} not found`);
    }

    if (Number(skill.ownerId) !== Number(userId)) {
      throw new ForbiddenException('Недостаточно прав');
    }

    this.deleteSkillImages(skill.images);

    await this.skillsRepository.deleteSkill(id);

    return {
      success: true,
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
}
