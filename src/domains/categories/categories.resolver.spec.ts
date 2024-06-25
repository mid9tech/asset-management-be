import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesResolver } from './categories.resolver';
import { CategoriesService } from './categories.service';

import { CreateCategoryInput } from './dto/create-category.input';

describe('CategoriesResolver', () => {
  let resolver: CategoriesResolver;
  let service: CategoriesService;

  const mockCategoriesService = {
    create: jest.fn(),
    getAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesResolver,
        { provide: CategoriesService, useValue: mockCategoriesService },
      ],
    }).compile();

    resolver = module.get<CategoriesResolver>(CategoriesResolver);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createCategory', () => {
    it('should call service.create with the correct arguments', async () => {
      const createCategoryInput: CreateCategoryInput = {
        categoryName: 'New Category',
        categoryCode: 'NWC',
      };
      const category = { id: 1, ...createCategoryInput };

      mockCategoriesService.create.mockResolvedValueOnce(category);

      const result = await resolver.createCategory(createCategoryInput);
      expect(result).toEqual(category);
      expect(service.create).toHaveBeenCalledWith(createCategoryInput);
    });
  });

  describe('getAll', () => {
    it('should call service.getAll and return the result', async () => {
      const categories = [
        { id: 1, categoryName: 'Category1', categoryCode: 'CAT1' },
      ];
      mockCategoriesService.getAll.mockResolvedValueOnce(categories);

      const result = await resolver.getAll();
      expect(result).toEqual(categories);
      expect(service.getAll).toHaveBeenCalled();
    });
  });
});
