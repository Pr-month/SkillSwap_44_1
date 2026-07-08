export interface SkillSeedData {
  title: string;
  description: string | null;
  category: string;
  ownerEmail: string;
}

export const skillsSeedData: SkillSeedData[] = [
  {
    title: 'Готовлю к ЕГЭ',
    description: 'Готовлю к ЕГЭ на 100',
    category: 'Английский язык',
    ownerEmail: 'alexey.skillswap@example.com',
  },
  {
    title: 'Обучение игре на скрипке',
    description: null,
    category: 'Скрипка',
    ownerEmail: 'alexey.skillswap@example.com',
  },
  {
    title: 'Курс вязания',
    description: 'Вяжем шарф',
    category: 'Онлайн-курсы',
    ownerEmail: 'maria.skillswap@example.com',
  },
  {
    title: 'Разрабатываю игры',
    description: 'Сделаем RDR2',
    category: 'GameDev',
    ownerEmail: 'maria.skillswap@example.com',
  },
];
