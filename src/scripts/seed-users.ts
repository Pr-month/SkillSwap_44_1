import 'reflect-metadata';
import 'dotenv/config';

import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';

import { Role } from '../users/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/users.enums';
import { UsersSeedConfig, getUsersSeedConfig } from './seed-users.data';

let dataSource: DataSource | null = null;

function createDataSource(databaseUrl: string): DataSource {
  return new DataSource({
    type: 'postgres',
    url: databaseUrl,
    entities: [User, Role],
    synchronize: false,
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

async function ensureRole(
  rolesRepository: Repository<Role>,
  id: UserRole,
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

async function ensureRolesSequence(source: DataSource): Promise<void> {
  await source.query(
    "SELECT setval(pg_get_serial_sequence('roles', 'id'), (SELECT COALESCE(MAX(id), 1) FROM roles))",
  );
}

async function ensureAdmin(
  usersRepository: Repository<User>,
  config: UsersSeedConfig,
): Promise<string> {
  const { admin } = config;
  const passwordHash = await bcrypt.hash(admin.password, config.hashSaltRounds);
  const existingAdmin = await usersRepository
    .createQueryBuilder('user')
    .where('LOWER(user.email) = :email', { email: admin.email })
    .getOne();

  if (existingAdmin) {
    const passwordMatches = await bcrypt.compare(
      admin.password,
      existingAdmin.passwordHash,
    );

    if (existingAdmin.roleId !== UserRole.ADMIN || !passwordMatches) {
      await usersRepository.update(existingAdmin.id, {
        roleId: UserRole.ADMIN,
        passwordHash: passwordMatches ? existingAdmin.passwordHash : passwordHash,
      });
    }

    return `Admin user already exists: ${admin.email}`;
  }

  await usersRepository.save(
    usersRepository.create({
      email: admin.email,
      passwordHash,
      name: admin.name,
      birthdate: admin.birthdate,
      city: admin.city,
      gender: admin.gender,
      roleId: UserRole.ADMIN,
      about: null,
      avatar: null,
      refreshTokenHash: null,
      skills: [],
      wantToLearn: [],
      favouriteSkills: [],
    }),
  );

  return `Admin user created: ${admin.email}`;
}

async function seedUsers(): Promise<void> {
  const seedConfig = getUsersSeedConfig();
  dataSource = createDataSource(seedConfig.databaseUrl);

  await dataSource.initialize();

  const rolesRepository = dataSource.getRepository(Role);
  const usersRepository = dataSource.getRepository(User);

  await ensureRole(rolesRepository, UserRole.ADMIN, UserRole.ADMIN);
  await ensureRole(rolesRepository, UserRole.USER, UserRole.USER);
  await ensureRolesSequence(dataSource);

  const message = await ensureAdmin(usersRepository, seedConfig);
  console.log(message);
}

seedUsers()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });
