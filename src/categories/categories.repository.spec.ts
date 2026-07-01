import { DataSource, FindOperator } from 'typeorm';
import { CategoriesRepository } from './categories.repository';
import { Category } from './entities/category.entity';

describe('CategoriesRepository', () => {
  let repository: CategoriesRepository;

  beforeEach(() => {
    const dataSource = {
      createEntityManager: jest.fn().mockReturnValue({}),
    } as unknown as DataSource;

    repository = new CategoriesRepository(dataSource);
  });

  it('должен запрашивать только родительские категории с подкатегориями', async () => {
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

    const findSpy = jest.spyOn(repository, 'find').mockResolvedValue(categories);

    await expect(repository.findRootCategories()).resolves.toBe(categories);
    expect(findSpy).toHaveBeenCalledTimes(1);

    const findOptions = findSpy.mock.calls[0][0];
    const where = findOptions?.where as { parentId?: unknown };

    expect(findOptions?.relations).toEqual({ children: true });
    expect(where.parentId).toBeInstanceOf(FindOperator);
    expect((where.parentId as FindOperator<unknown>).type).toBe('isNull');
  });
});
