import 'dotenv/config';

import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';

import { appConfig } from '../common/config/app.config';
import { dataSource } from '../common/config/database.config';
import { Role } from '../users/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/users.enums';
import { AdminSeedData, getAdminSeedData } from './seed-admin.data';

const ADMIN_ROLE_ID = Number(UserRole.ADMIN);
const USER_ROLE_ID = Number(UserRole.USER);

async function ensureRole(
  rolesRepository: Repository<Role>,
  id: number,
  name: UserRole,
): Promise<void> {
  const role = await rolesRepository.findOne({ where: { id } });

  if (role) {
    if (role.name !== name) {
      await rolesRepository.update(id, { name });
    }

    return;
  }

  await rolesRepository.save(
    rolesRepository.create({
      id,
      name,
    }),
  );
}

async function ensureRolesSequence(dataSource: DataSource): Promise<void> {
  await dataSource.query(
    "SELECT setval(pg_get_serial_sequence('roles', 'id'), (SELECT COALESCE(MAX(id), 1) FROM roles))",
  );
}

async function ensureAdmin(
  usersRepository: Repository<User>,
  admin: AdminSeedData,
  hashSaltRounds: number,
): Promise<string> {
  const existingAdmin = await usersRepository
    .createQueryBuilder('user')
    .where('LOWER(user.email) = :email', { email: admin.email })
    .getOne();
  const passwordHash = await bcrypt.hash(admin.password, hashSaltRounds);
  const adminValues: Partial<User> = {
    email: admin.email,
    passwordHash,
    name: admin.name,
    birthdate: admin.birthdate,
    city: admin.city,
    gender: admin.gender,
    roleId: ADMIN_ROLE_ID,
    about: null,
    avatar: null,
    refreshTokenHash: null,
    skills: [],
    wantToLearn: [],
    favouriteSkills: [],
  };

  if (existingAdmin) {
    const currentPasswordHash = existingAdmin.passwordHash;
    const passwordMatches = await bcrypt.compare(
      admin.password,
      currentPasswordHash,
    );

    await usersRepository.update(existingAdmin.id, {
      ...adminValues,
      passwordHash: passwordMatches ? currentPasswordHash : passwordHash,
    });

    return `Admin user already exists: ${admin.email}`;
  }

  await usersRepository.save(usersRepository.create(adminValues));

  return `Admin user created: ${admin.email}`;
}

async function seedAdmin(): Promise<void> {
  await dataSource.initialize();

  try {
    const usersRepository = dataSource.getRepository(User);
    const rolesRepository = dataSource.getRepository(Role);
    const config = appConfig();
    const admin = getAdminSeedData();

    await ensureRole(rolesRepository, ADMIN_ROLE_ID, UserRole.ADMIN);
    await ensureRole(rolesRepository, USER_ROLE_ID, UserRole.USER);
    await ensureRolesSequence(dataSource);

    const message = await ensureAdmin(
      usersRepository,
      admin,
      config.hashSaltRounds,
    );
    console.log(message);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

void seedAdmin().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
