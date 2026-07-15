import { Skill } from '../skills/entities/skill.entity';
import { SkillSeedData, skillsSeedData } from './seed-skills.data';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SkillsRepository } from '../skills/skills.repository';
import { CategoriesRepository } from '../categories/categories.repository';
import { UserRepository } from '../users/users.repository';

async function ensureSkill(
  skillsRepository: SkillsRepository,
  categoriesRepository: CategoriesRepository,
  userRepository: UserRepository,
  skillData: SkillSeedData,
): Promise<Skill> {
  const category = await categoriesRepository.findOne({
    where: { name: skillData.category },
  });

  if (!category) {
    throw new Error(`Category ${skillData.category} not found`);
  }

  const user = await userRepository.findOne({
    where: { email: skillData.ownerEmail.toLowerCase() },
  });

  if (!user) {
    throw new Error(`User ${skillData.ownerEmail} not found`);
  }

  const existingSkill = await skillsRepository.findOne({
    where: { title: skillData.title, ownerId: user.id },
  });

  if (existingSkill) {
    return existingSkill;
  }

  return skillsRepository.save(
    skillsRepository.create({
      title: skillData.title,
      description: skillData.description,
      categoryId: category.id,
      ownerId: user.id,
    }),
  );
}

export async function seedSkills(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
    abortOnError: false,
  });

  try {
    const skillsRepository = app.get(SkillsRepository);
    const categoriesRepository = app.get(CategoriesRepository);
    const userRepository = app.get(UserRepository);

    for (const skillData of skillsSeedData) {
      await ensureSkill(
        skillsRepository,
        categoriesRepository,
        userRepository,
        skillData,
      );
    }

    console.log(`Skills seeding completed: ${skillsSeedData.length}`);
  } finally {
    await app.close();
  }
}

void seedSkills().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
