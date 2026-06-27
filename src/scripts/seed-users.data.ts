import { Gender } from '../users/users.enums';
import { adminConfig } from '../common/config/admin.config';
import { appConfig } from '../common/config/app.config';
import { databaseConfig } from '../common/config/database.config';

export interface AdminSeedData {
  email: string;
  password: string;
  name: string;
  birthdate: Date;
  city: string;
  gender: Gender;
}

export interface UsersSeedConfig {
  databaseUrl: string;
  hashSaltRounds: number;
  admin: AdminSeedData;
}

const DEFAULT_HASH_SALT_ROUNDS = 10;

function getRequiredConfigValue(
  name: string,
  value: string | undefined,
): string {
  if (!value || !value.trim()) {
    throw new Error(`${name} is required for users seeding`);
  }

  return value.trim();
}

function parseAdminBirthdate(value: string): Date {
  const birthdate = new Date(value);

  if (Number.isNaN(birthdate.getTime())) {
    throw new Error('ADMIN_BIRTHDATE must be a valid date');
  }

  return birthdate;
}

function parseAdminGender(value: string): Gender {
  if (Object.values(Gender).includes(value as Gender)) {
    return value as Gender;
  }

  throw new Error(
    `ADMIN_GENDER must be one of: ${Object.values(Gender).join(', ')}`,
  );
}

function parseHashSaltRounds(value: string | undefined): number {
  const parsedValue = Number(value);

  if (Number.isInteger(parsedValue) && parsedValue > 0) {
    return parsedValue;
  }

  return DEFAULT_HASH_SALT_ROUNDS;
}

export function getUsersSeedConfig(): UsersSeedConfig {
  const app = appConfig();
  const admin = adminConfig();
  const database = databaseConfig();

  return {
    databaseUrl: getRequiredConfigValue('DATABASE_URL', database.url),
    hashSaltRounds: parseHashSaltRounds(String(app.hashSaltRounds)),
    admin: {
      email: getRequiredConfigValue('ADMIN_EMAIL', admin.email).toLowerCase(),
      password: getRequiredConfigValue('ADMIN_PASSWORD', admin.password),
      name: admin.name,
      birthdate: parseAdminBirthdate(admin.birthdate),
      city: admin.city,
      gender: parseAdminGender(admin.gender),
    },
  };
}
