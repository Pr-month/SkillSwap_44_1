import { adminConfig } from '../common/config/admin.config';
import { Gender } from '../users/users.enums';

export interface AdminSeedData {
  email: string;
  password: string;
  name: string;
  birthdate: Date;
  city: string;
  gender: Gender;
}

function getRequiredConfigValue(
  name: string,
  value: string | undefined,
): string {
  if (!value || !value.trim()) {
    throw new Error(`${name} is required for admin seeding`);
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

export function getAdminSeedData(): AdminSeedData {
  const admin = adminConfig();

  return {
    email: getRequiredConfigValue('ADMIN_EMAIL', admin.email).toLowerCase(),
    password: getRequiredConfigValue('ADMIN_PASSWORD', admin.password),
    name: admin.name,
    birthdate: parseAdminBirthdate(admin.birthdate),
    city: admin.city,
    gender: parseAdminGender(admin.gender),
  };
}
