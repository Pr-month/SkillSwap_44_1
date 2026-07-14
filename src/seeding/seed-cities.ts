import { AppModule } from 'src/app.module';
import { City } from 'src/cities/entities/cities.entity';
import { citiesSeedData } from './seed-cities.data';

import { NestFactory } from '@nestjs/core';
import { DataSource, Repository } from 'typeorm';

// функция для проверки существования города в бд
async function ensureCity(
  citiesRepository: Repository<City>,
  name: string,
): Promise<City> {
  // пробуем найти город по названию
  const city = await citiesRepository.findOne({
    where: {
      name: name,
    },
  });

  // если нашли - возвращаем город
  if (city) {
    return city;
  }

  // если не нашли - создаем город
  return citiesRepository.save(citiesRepository.create({ name }));
}

async function seedCities(): Promise<void> {
  // создаем Nest приложение без веб сервера для подключения к бд
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    // получаем объект который знает все про бд
    const dataSource = app.get(DataSource);

    const citiesRepository = dataSource.getRepository(City);

    let createdOrUpdatedCount = 0;

    // теперь проходимся по каждому городу и если его нет в бд то кладем туда
    for (const city of citiesSeedData) {
      await ensureCity(citiesRepository, city.name);
      createdOrUpdatedCount++;
    }

    console.log(`Cities seeding completed: ${createdOrUpdatedCount}`);
  } finally {
    //закрываем приложение
    await app.close();
  }
}

// обрабатываем ошибки
void seedCities().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
