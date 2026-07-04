import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';

import { AppModule } from '../app.module';
import { appConfig, TAppConfig } from '../common/config/app.config';
import { Role } from '../users/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { UserRepository } from '../users/users.repository';
import { UserRole } from '../users/users.enums';
import { UserSeedData, usersSeedData } from './seed-users.data';
import { dataSource } from '../common/config/database.config';
import { City } from '../cities/entities/cities.entity';

async function ensureUserRole(
  rolesRepository: Repository<Role>,
): Promise<void> {
  const userRole = await rolesRepository.findOne({
    where: { id: UserRole.USER },
  });

  if (userRole) {
    if (userRole.name !== UserRole.USER) {
      await rolesRepository.update(UserRole.USER, { name: UserRole.USER });
    }

    return;
  }

  await rolesRepository.save(
    rolesRepository.create({
      id: UserRole.USER,
      name: UserRole.USER,
    }),
  );
}

async function ensureRolesSequence(dataSource: DataSource): Promise<void> {
  await dataSource.query(
    "SELECT setval(pg_get_serial_sequence('roles', 'id'), (SELECT COALESCE(MAX(id), 1) FROM roles))",
  );
}

async function ensureUser(
  usersRepository: UserRepository,
  userData: UserSeedData,
  hashSaltRounds: number,
): Promise<User> {
  const existingUser = await usersRepository.findByEmailWithPassword(
    userData.email,
  );

  const userCity = dataSource.getRepository(City);

  const city = await userCity.findOne({
    where: { id: userData.city },
  });

  if (!city) 
    throw new Error('city not found');


  const passwordHash = await bcrypt.hash(userData.password, hashSaltRounds);
  const userValues: Partial<User> = {
    email: userData.email,
    passwordHash,
    name: userData.name,
    birthdate: userData.birthdate,
    city: city,
    gender: userData.gender,
    roleId: UserRole.USER,
    about: userData.about,
    avatar: userData.avatar,
    skills: userData.skills,
    wantToLearn: userData.wantToLearn,
    favouriteSkills: userData.favouriteSkills,
  };

  if (existingUser) {
    await usersRepository.updateUser(existingUser.id, userValues);

    const updatedUser = await usersRepository.findById(existingUser.id);

    if (!updatedUser) {
      throw new Error(`Seeded user was not found: ${userData.email}`);
    }

    return updatedUser;
  }

  return usersRepository.save(usersRepository.create(userValues));
}

async function seedUsers(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
    abortOnError: false,
  });

  try {
    const dataSource = app.get(DataSource);
    const usersRepository = app.get(UserRepository);
    const rolesRepository = dataSource.getRepository(Role);
    const config = app.get<TAppConfig>(appConfig.KEY);

    await ensureUserRole(rolesRepository);
    await ensureRolesSequence(dataSource);

    for (const userData of usersSeedData) {
      await ensureUser(usersRepository, userData, config.hashSaltRounds);
    }

    console.log(`Users seeding completed: ${usersSeedData.length}`);
  } finally {
    await app.close();
  }
}

void seedUsers().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
