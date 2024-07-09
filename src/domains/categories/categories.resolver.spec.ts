import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesResolver } from './categories.resolver';
import { CategoriesService } from './categories.service';
import { CreateCategoryInput } from './dto/create-category.input';
import { ReportInput } from './dto/report.input';
import { currentUserMock } from 'src/shared/__mocks__';

describe('CategoriesResolver', () => {
  let resolver: CategoriesResolver;
  // let service: CategoriesService;

  const mockCategoriesService = {
    create: jest.fn(),
    getAll: jest.fn(),
    getReport: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesResolver,
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    resolver = module.get<CategoriesResolver>(CategoriesResolver);
    // service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createCategory', () => {
    it('should create a category', async () => {
      const createCategoryInput: CreateCategoryInput = {
        categoryName: 'New Category',
        categoryCode: 'NWC',
      };
      const category = { id: 1, ...createCategoryInput };
      mockCategoriesService.create.mockResolvedValueOnce(category);

      const result = await resolver.createCategory(createCategoryInput);
      expect(result).toEqual(category);
      expect(mockCategoriesService.create).toHaveBeenCalledWith(
        createCategoryInput,
      );
    });
  });

  describe('getAll', () => {
    it('should return all categories', async () => {
      const categories = [
        { id: 1, categoryName: 'Category1', categoryCode: 'CAT1' },
      ];
      mockCategoriesService.getAll.mockResolvedValueOnce(categories);

      const result = await resolver.getAll();
      expect(result).toEqual(categories);
      expect(mockCategoriesService.getAll).toHaveBeenCalled();
    });
  });

  describe('getReport', () => {
    it('should return report data', async () => {
      const reportInput: ReportInput = {
        page: 1,
        limit: 10,
        sortOrder: 'asc',
        sort: '',
      };
      const reportData = {
        total: 5,
        totalPages: 1,
        page: 1,
        limit: 10,
        data: [
          {
            category_name: 'Grocery',
            total: 1,
            assigned: 0,
            available: 0,
            not_available: 1,
            waiting_for_recycling: 0,
            recycled: 0,
          },
        ],
      };
      mockCategoriesService.getReport.mockResolvedValueOnce(reportData);

      const result = await resolver.getReport(reportInput, currentUserMock);
      expect(result).toEqual(reportData);
    });
  });
});
