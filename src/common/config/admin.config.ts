import { ConfigType, registerAs } from '@nestjs/config';

export const adminConfig = registerAs('ADMIN_CONFIG', () => ({
  email: process.env.ADMIN_EMAIL?.trim().toLowerCase(),
  password: process.env.ADMIN_PASSWORD?.trim(),
  name: process.env.ADMIN_NAME?.trim() || 'Admin',
  birthdate: process.env.ADMIN_BIRTHDATE?.trim() || '1990-07-07',
  city: process.env.ADMIN_CITY?.trim() || 'Moscow',
  gender: process.env.ADMIN_GENDER?.trim() || 'male',
}));

export type TAdminConfig = ConfigType<typeof adminConfig>;
