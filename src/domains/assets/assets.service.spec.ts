import { Test, TestingModule } from '@nestjs/testing';
import { AssetsService } from './assets.service';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { CategoriesService } from '../categories/categories.service';
import { CreateAssetInput } from './dto/create-asset.input';
import { UpdateAssetInput } from './dto/update-asset.input';
import { LOCATION, ASSET_STATE } from 'src/shared/enums';
import { MyBadRequestException } from 'src/shared/exceptions';

describe('AssetsService', () => {
  let service: AssetsService;
  let prismaService: PrismaService;
  let categoriesService: CategoriesService;

  const mockPrismaService = {
    asset: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const mockCategoriesService = {
    getPrefixById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CategoriesService, useValue: mockCategoriesService },
      ],
    }).compile();

    service = module.get<AssetsService>(AssetsService);
    prismaService = module.get<PrismaService>(PrismaService);
    categoriesService = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw an error if asset name is invalid', async () => {
      const createAssetInput: CreateAssetInput = {
        assetName: '',
        categoryId: 1,
        installedDate: '2023-01-01',
        state: ASSET_STATE.AVAILABLE,
        specification: '',
      };

      await expect(
        service.create(createAssetInput, LOCATION.HCM),
      ).rejects.toThrow(MyBadRequestException);
    });

    it('should throw an error if category ID is invalid', async () => {
      const createAssetInput: CreateAssetInput = {
        assetName: 'Asset1',
        categoryId: 0,
        installedDate: '2023-01-01',
        state: ASSET_STATE.AVAILABLE,
        specification: '',
      };

      await expect(
        service.create(createAssetInput, LOCATION.HCM),
      ).rejects.toThrow(MyBadRequestException);
    });

    it('should throw an error if installed date is invalid', async () => {
      const createAssetInput: CreateAssetInput = {
        assetName: 'Asset1',
        categoryId: 1,
        installedDate: 'invalid-date',
        state: ASSET_STATE.AVAILABLE,
        specification: '',
      };

      await expect(
        service.create(createAssetInput, LOCATION.HCM),
      ).rejects.toThrow(MyBadRequestException);
    });

    it('should throw an error if state is invalid', async () => {
      const createAssetInput: CreateAssetInput = {
        assetName: 'Asset1',
        categoryId: 1,
        installedDate: '2023-01-01',
        state: '',
        specification: '',
      };

      await expect(
        service.create(createAssetInput, LOCATION.HCM),
      ).rejects.toThrow(MyBadRequestException);
    });

    it('should create a new asset if inputs are valid', async () => {
      const createAssetInput: CreateAssetInput = {
        assetName: 'Asset1',
        categoryId: 1,
        installedDate: '2023-01-01',
        state: ASSET_STATE.AVAILABLE,
        specification: '',
      };
      const asset = {
        id: 1,
        ...createAssetInput,
        assetCode: 'CAT000001',
        location: LOCATION.HCM,
        state: ASSET_STATE.AVAILABLE,
      };

      mockCategoriesService.getPrefixById.mockResolvedValue('CAT');
      mockPrismaService.asset.findFirst.mockResolvedValue(null);
      mockPrismaService.asset.create.mockResolvedValue(asset);

      const result = await service.create(createAssetInput, LOCATION.HCM);
      expect(result).toEqual(asset);
      expect(prismaService.asset.create).toHaveBeenCalledWith({
        data: {
          ...createAssetInput,
          installedDate: new Date(createAssetInput.installedDate).toISOString(),
          assetCode: 'CAT000001',
          location: LOCATION.HCM,
          state: ASSET_STATE.AVAILABLE,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all assets', async () => {
      const assets = [
        {
          id: 1,
          assetName: 'Asset1',
          categoryId: 1,
          installedDate: '2023-01-01',
          state: ASSET_STATE.AVAILABLE,
        },
      ];
      mockPrismaService.asset.findMany.mockResolvedValueOnce(assets);

      const result = await service.findAll();
      expect(result).toEqual(assets);
    });
  });

  describe('findOne', () => {
    it('should return a string with the asset id', () => {
      const id = 1;
      const result = service.findOne(id);
      expect(result).toBe(`This action returns a #${id} asset`);
    });
  });

  describe('update', () => {
    it('should return a string with the asset id and update data', () => {
      const id = 1;
      const updateAssetInput: UpdateAssetInput = {
        id: 1,
        assetName: 'Updated Asset',
      };
      const result = service.update(id, updateAssetInput);
      expect(result).toBe(
        `This action updates a #${id} asset: ${updateAssetInput}`,
      );
    });
  });

  describe('remove', () => {
    it('should return a string with the asset id', () => {
      const id = 1;
      const result = service.remove(id);
      expect(result).toBe(`This action removes a #${id} asset`);
    });
  });

  describe('generateAssetCode', () => {
    it('should generate a new asset code', async () => {
      mockCategoriesService.getPrefixById.mockResolvedValue('CAT');
      mockPrismaService.asset.findFirst.mockResolvedValue(null);

      const result = await service.generateAssetCode(1);
      expect(result).toBe('CAT000001');
    });

    it('should generate a new asset code with an incremented id', async () => {
      mockCategoriesService.getPrefixById.mockResolvedValue('CAT');
      mockPrismaService.asset.findFirst.mockResolvedValue({ id: 1 });

      const result = await service.generateAssetCode(1);
      expect(result).toBe('CAT000002');
    });
  });
});
