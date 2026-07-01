import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let categoriesService: { findAll: jest.Mock };

  beforeEach(async () => {
    categoriesService = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: categoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('должен быть определен', () => {
    expect(controller).toBeDefined();
  });

  it('должен возвращать категории из сервиса', async () => {
    const categories: Category[] = [
      {
        id: 1,
        name: 'Программирование',
        parentId: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        parent: null,
        children: [],
        skills: [],
      },
    ];

    categoriesService.findAll.mockResolvedValue(categories);

    await expect(controller.findAll()).resolves.toBe(categories);
    expect(categoriesService.findAll).toHaveBeenCalledTimes(1);
  });
});
