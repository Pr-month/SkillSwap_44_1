import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { CategoriesRepository } from './categories.repository';
import { Category } from './entities/category.entity';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoriesRepository: { findRootCategories: jest.Mock };

  beforeEach(async () => {
    categoriesRepository = {
      findRootCategories: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: CategoriesRepository,
          useValue: categoriesRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  it('должен возвращать родительские категории с подкатегориями', async () => {
    const childCategory: Category = {
      id: 2,
      name: 'Бэкенд',
      parentId: 1,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      parent: null,
      children: [],
      skills: [],
    };
    const categories: Category[] = [
      {
        id: 1,
        name: 'Программирование',
        parentId: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        parent: null,
        children: [childCategory],
        skills: [],
      },
    ];

    categoriesRepository.findRootCategories.mockResolvedValue(categories);

    await expect(service.findAll()).resolves.toBe(categories);
    expect(categoriesRepository.findRootCategories).toHaveBeenCalledTimes(1);
  });
});
