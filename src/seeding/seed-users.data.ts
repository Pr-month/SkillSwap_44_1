import { Gender } from '../users/users.enums';

export interface UserSeedData {
  email: string;
  password: string;
  name: string;
  birthdate: Date;
  city: string;
  gender: Gender;
  about: string | null;
  avatar: string | null;
  skills: string[];
  wantToLearn: string[];
  favouriteSkills: string[];
}

export const usersSeedData: UserSeedData[] = [
  {
    email: 'alexey.skillswap@example.com',
    password: 'password123',
    name: 'Алексей',
    birthdate: new Date('1996-04-12'),
    city: 'Москва',
    gender: Gender.MALE,
    about: 'Помогаю разобраться с backend-разработкой.',
    avatar: null,
    skills: [],
    wantToLearn: [],
    favouriteSkills: [],
  },
  {
    email: 'maria.skillswap@example.com',
    password: 'password123',
    name: 'Мария',
    birthdate: new Date('1998-09-25'),
    city: 'Санкт-Петербург',
    gender: Gender.FEMALE,
    about: 'Обмениваю знания по дизайну и исследованию пользователей.',
    avatar: null,
    skills: [],
    wantToLearn: [],
    favouriteSkills: [],
  },
];
