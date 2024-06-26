import { Test, TestingModule } from '@nestjs/testing';
import { AssetsService } from './assets.service';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { CategoriesService } from '../categories/categories.service';
import { CreateAssetInput } from './dto/create-asset.input';
import { LOCATION, ASSET_STATE } from 'src/shared/enums';
import { MyBadRequestException } from 'src/shared/exceptions';
import { FindAssetsInput } from './dto/find-assets.input';
import { FindAssetsOutput } from './dto/find-assets.output';

describe('AssetsService', () => {
  let service: AssetsService;
  let prismaService: PrismaService;
  let categoriesService: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsService,
        {
          provide: PrismaService,
          useValue: {
            asset: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              count: jest.fn(),
            },
          },
        },
        {
          provide: CategoriesService,
          useValue: {
            getPrefixById: jest.fn(),
          },
        },
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
    it('should create an asset successfully', async () => {
      const createAssetInput: CreateAssetInput = {
        assetName: 'Asset 1',
        categoryId: 1,
        installedDate: '2021-01-01',
        state: ASSET_STATE.AVAILABLE,
        specification: 'Spec',
      };

      const assetCode = 'CAT000001';
      jest.spyOn(service, 'generateAssetCode').mockResolvedValue(assetCode);
      jest.spyOn(prismaService.asset, 'create').mockResolvedValue({
        id: 1,
        assetCode,
        assetName: createAssetInput.assetName,
        categoryId: createAssetInput.categoryId,
        installedDate: new Date(createAssetInput.installedDate),
        state: ASSET_STATE[createAssetInput.state],
        location: LOCATION.HCM,
        specification: createAssetInput.specification,
        createdAt: new Date(),
        updatedAt: new Date(),
        isRemoved: false,
      });

      const result = await service.create(createAssetInput, LOCATION.HCM);
      expect(result).toEqual({
        id: 1,
        ...createAssetInput,
        installedDate: expect.any(Date),
        assetCode,
        location: LOCATION.HCM,
        state: ASSET_STATE[createAssetInput.state],
        updatedAt: expect.any(Date),
        createdAt: expect.any(Date),
        isRemoved: false,
      });
    });

    it('should throw an error for invalid assetName', async () => {
      const createAssetInput: CreateAssetInput = {
        assetName: '',
        categoryId: 1,
        installedDate: '2021-01-01',
        state: ASSET_STATE.AVAILABLE,
        specification: 'Spec',
      };

      await expect(
        service.create(createAssetInput, LOCATION.HCM),
      ).rejects.toThrow(new MyBadRequestException('Asset name is invalid'));
    });

    it('should throw an error for invalid categoryId', async () => {
      const createAssetInput: CreateAssetInput = {
        assetName: 'Asset 1',
        categoryId: 0,
        installedDate: '2021-01-01',
        state: ASSET_STATE.AVAILABLE,
        specification: 'Spec',
      };

      await expect(
        service.create(createAssetInput, LOCATION.HCM),
      ).rejects.toThrow(new MyBadRequestException('Category is invalid'));
    });

    it('should throw an error for invalid installedDate', async () => {
      const createAssetInput: CreateAssetInput = {
        assetName: 'Asset 1',
        categoryId: 1,
        installedDate: 'invalid-date',
        state: ASSET_STATE.AVAILABLE,
        specification: 'Spec',
      };

      await expect(
        service.create(createAssetInput, LOCATION.HCM),
      ).rejects.toThrow(new MyBadRequestException('Installed date is invalid'));
    });

    it('should throw an error for invalid state', async () => {
      const createAssetInput: CreateAssetInput = {
        assetName: 'Asset 1',
        categoryId: 1,
        installedDate: '2021-01-01',
        state: '',
        specification: 'Spec',
      };

      await expect(
        service.create(createAssetInput, LOCATION.HCM),
      ).rejects.toThrow(new MyBadRequestException('State is invalid'));
    });
  });

  describe('findAssets', () => {
    it('should find assets successfully', async () => {
      const findAssetsInput: FindAssetsInput = {
        page: 1,
        limit: 10,
        query: 'Asset',
        sortField: 'assetCode',
        sortOrder: 'asc',
        stateFilter: 'AVAILABLE',
        categoryFilter: 1,
      };

      const assets = [
        {
          id: 1,
          assetName: 'Asset 1',
          assetCode: 'CAT000001',
          location: LOCATION.HCM,
          state: ASSET_STATE.AVAILABLE,
          installedDate: new Date('2021-01-01'),
          categoryId: 1,
          specification: 'Spec',
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any,
      ];
      jest.spyOn(prismaService.asset, 'count').mockResolvedValue(1);
      jest.spyOn(prismaService.asset, 'findMany').mockResolvedValue(assets);

      const result = await service.findAssets(findAssetsInput, LOCATION.HCM);
      expect(result).toEqual({
        assets: assets.map((asset) => ({
          ...asset,
          installedDate: asset.installedDate.toISOString(),
        })),
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      } as FindAssetsOutput);
    });

    it('should handle errors when finding assets', async () => {
      const findAssetsInput: FindAssetsInput = {
        page: 1,
        limit: 10,
        query: 'Asset',
        sortField: 'assetCode',
        sortOrder: 'asc',
        stateFilter: 'AVAILABLE',
        categoryFilter: 1,
      };

      jest
        .spyOn(prismaService.asset, 'count')
        .mockRejectedValue(new Error('Database error'));
      await expect(
        service.findAssets(findAssetsInput, LOCATION.HCM),
      ).rejects.toThrow(new MyBadRequestException('Error finding assets'));
    });
  });

  describe('findAll', () => {
    it('should find all assets successfully', async () => {
      const assets = [
        {
          id: 1,
          assetName: 'Asset 1',
          assetCode: 'CAT000001',
          location: LOCATION.HCM,
          state: ASSET_STATE.AVAILABLE,
          installedDate: new Date('2021-01-01'),
          categoryId: 1,
          specification: 'Spec',
        },
      ] as any;
      jest.spyOn(prismaService.asset, 'findMany').mockResolvedValue(assets);

      const result = await service.findAll();
      expect(result).toEqual(assets);
    });
  });

  describe('findOne', () => {
    it('should find one asset successfully', async () => {
      const asset = {
        id: 1,
        assetName: 'Asset 1',
        assetCode: 'CAT000001',
        location: LOCATION.HCM,
        state: ASSET_STATE.AVAILABLE,
        installedDate: new Date('2021-01-01'),
        categoryId: 1,
        specification: 'Spec',
      } as any;
      jest.spyOn(prismaService.asset, 'findUnique').mockResolvedValue(asset);

      const result = await service.findOne(1, LOCATION.HCM);
      expect(result).toEqual(asset);
    });

    it('should throw an error if asset is not found in location', async () => {
      const asset = {
        id: 1,
        assetName: 'Asset 1',
        assetCode: 'CAT000001',
        location: LOCATION.HN,
        state: ASSET_STATE.AVAILABLE,
        installedDate: new Date('2021-01-01'),
        categoryId: 1,
        specification: 'Spec',
      } as any;
      jest.spyOn(prismaService.asset, 'findUnique').mockResolvedValue(asset);

      await expect(service.findOne(1, LOCATION.HCM)).rejects.toThrow(
        new MyBadRequestException('Asset not found in your location'),
      );
    });
  });

  describe('generateAssetCode', () => {
    it('should generate an asset code successfully', async () => {
      const categoryId = 1;
      const prefix = 'CAT';
      jest.spyOn(categoriesService, 'getPrefixById').mockResolvedValue(prefix);
      jest.spyOn(prismaService.asset, 'count').mockResolvedValue(0);

      const assetCode = await service.generateAssetCode(categoryId);
      expect(assetCode).toBe('CAT000001');
    });

    it('should generate an asset code with existing assets', async () => {
      const categoryId = 1;
      const prefix = 'CAT';
      jest.spyOn(categoriesService, 'getPrefixById').mockResolvedValue(prefix);
      jest.spyOn(prismaService.asset, 'count').mockResolvedValue(5);

      const assetCode = await service.generateAssetCode(categoryId);
      expect(assetCode).toBe('CAT000006');
    });
  });
});
