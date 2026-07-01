import { NestFactory } from '@nestjs/core';
import { DataSource, IsNull, Repository } from 'typeorm';

import { AppModule } from '../app.module';
import { Category } from '../categories/entities/category.entity';
import { categoriesSeedData } from './seed-categories.data';

async function ensureCategory(
  categoriesRepository: Repository<Category>,
  name: string,
  parentId: number | null,
): Promise<Category> {
  const category = await categoriesRepository.findOne({
    where: {
      name,
      parentId: parentId ?? IsNull(),
    },
  });

  if (category) {
    return category;
  }

  return categoriesRepository.save(
    categoriesRepository.create({
      name,
      parentId,
    }),
  );
}

async function seedCategories(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
    abortOnError: false,
  });

  try {
    const dataSource = app.get(DataSource);
    const categoriesRepository = dataSource.getRepository(Category);

    let createdOrUpdatedCount = 0;

    for (const categoryData of categoriesSeedData) {
      const parentCategory = await ensureCategory(
        categoriesRepository,
        categoryData.name,
        null,
      );

      createdOrUpdatedCount += 1;

      for (const childName of categoryData.children) {
        await ensureCategory(
          categoriesRepository,
          childName,
          parentCategory.id,
        );
        createdOrUpdatedCount += 1;
      }
    }

    console.log(`Categories seeding completed: ${createdOrUpdatedCount}`);
  } finally {
    await app.close();
  }
}

void seedCategories().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
