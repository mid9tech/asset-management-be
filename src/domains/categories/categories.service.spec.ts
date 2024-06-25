import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from 'src/services/prisma/prisma.service';
import {
  MyBadRequestException,
  MyEntityNotFoundException,
} from 'src/shared/exceptions';
import { CreateCategoryInput } from './dto/create-category.input';

describe('CategoriesService', () => {
  let service: CategoriesService;
  // let prismaService: PrismaService;

  const mockPrismaService = {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    // prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw an error if category name already exists', async () => {
      mockPrismaService.category.findUnique.mockResolvedValueOnce(true);

      const createCategoryInput: CreateCategoryInput = {
        categoryName: 'Existing Category',
        categoryCode: 'EXC',
      };

      await expect(service.create(createCategoryInput)).rejects.toThrow(
        MyBadRequestException,
      );
    });

    it('should throw an error if category code already exists', async () => {
      mockPrismaService.category.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.category.findFirst.mockResolvedValueOnce(true);

      const createCategoryInput: CreateCategoryInput = {
        categoryName: 'New Category',
        categoryCode: 'EXC',
      };

      await expect(service.create(createCategoryInput)).rejects.toThrow(
        MyBadRequestException,
      );
    });

    it('should create a new category if inputs are valid', async () => {
      const createCategoryInput: CreateCategoryInput = {
        categoryName: 'New Category',
        categoryCode: 'NWC',
      };

      mockPrismaService.category.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.category.findFirst.mockResolvedValueOnce(null);
      mockPrismaService.category.create.mockResolvedValueOnce({
        id: 1,
        ...createCategoryInput,
      });

      const result = await service.create(createCategoryInput);
      expect(result).toEqual({ id: 1, ...createCategoryInput });
    });
  });

  describe('getAll', () => {
    it('should return all categories', async () => {
      const categories = [
        { id: 1, categoryName: 'Category1', categoryCode: 'CAT1' },
      ];
      mockPrismaService.category.findMany.mockResolvedValueOnce(categories);

      const result = await service.getAll();
      expect(result).toEqual(categories);
    });
  });

  describe('categoryCodeExists', () => {
    it('should return true if category code exists', async () => {
      mockPrismaService.category.findFirst.mockResolvedValueOnce(true);

      const result = await service.categoryCodeExists('CAT1');
      expect(result).toBe(true);
    });

    it('should return false if category code does not exist', async () => {
      mockPrismaService.category.findFirst.mockResolvedValueOnce(null);

      const result = await service.categoryCodeExists('CAT1');
      expect(result).toBe(false);
    });

    it('should throw an exception if an error occurs', async () => {
      mockPrismaService.category.findFirst.mockRejectedValueOnce(new Error());

      await expect(service.categoryCodeExists('CAT1')).rejects.toThrow(
        MyEntityNotFoundException,
      );
    });
  });

  describe('categoryNameExists', () => {
    it('should return true if category name exists', async () => {
      mockPrismaService.category.findUnique.mockResolvedValueOnce(true);

      const result = await service.categoryNameExists('Category1');
      expect(result).toBe(true);
    });

    it('should return false if category name does not exist', async () => {
      mockPrismaService.category.findUnique.mockResolvedValueOnce(null);

      const result = await service.categoryNameExists('Category1');
      expect(result).toBe(false);
    });
  });

  describe('getPrefixById', () => {
    it('should return category code by id', async () => {
      const category = {
        id: 1,
        categoryName: 'Category1',
        categoryCode: 'CAT1',
      };
      mockPrismaService.category.findUnique.mockResolvedValueOnce(category);

      const result = await service.getPrefixById(1);
      expect(result).toBe('CAT1');
    });
  });

  describe('findById', () => {
    it('should return a category if found by id', async () => {
      const category = {
        id: 1,
        categoryName: 'Category1',
        categoryCode: 'CAT1',
      };
      mockPrismaService.category.findUnique.mockResolvedValueOnce(category);

      const result = await service.findById(1);
      expect(result).toEqual(category);
    });

    it('should throw an exception if category is not found by id', async () => {
      mockPrismaService.category.findUnique.mockResolvedValueOnce(null);

      await expect(service.findById(1)).rejects.toThrow(
        MyEntityNotFoundException,
      );
    });
  });
});
