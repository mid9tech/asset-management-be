import { Test, TestingModule } from '@nestjs/testing';
import { AssetsService } from './assets.service';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { CategoriesService } from '../categories/categories.service';
import { CreateAssetInput } from './dto/create-asset.input';
import { LOCATION, ASSET_STATE } from 'src/shared/enums';
import { MyBadRequestException } from 'src/shared/exceptions';
import { FindAssetsInput } from './dto/find-assets.input';
import { UpdateAssetInput } from './dto/update-asset.input';

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
              update: jest.fn(),
              findFirst: jest.fn(),
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
    const createAssetInput: CreateAssetInput = {
      assetName: 'Asset 1',
      categoryId: 1,
      installedDate: '2021-01-01',
      state: ASSET_STATE.AVAILABLE,
      specification: 'Spec',
    };
    it('should create an asset successfully', async () => {
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

    it.each([
      ['Asset name is invalid', { assetName: '' }],
      ['Category is invalid', { categoryId: 0 }],
      ['Installed date is invalid', { installedDate: 'invalid-date' }],
      ['State is invalid', { state: '' }],
    ])(
      'should throw an error for invalid input: %s',
      async (errorMsg, invalidInput) => {
        await expect(
          service.create(
            { ...createAssetInput, ...invalidInput },
            LOCATION.HCM,
          ),
        ).rejects.toThrow(new MyBadRequestException(errorMsg));
      },
    );
  });

  describe('update', () => {
    const existingAsset = {
      id: 1,
      assetCode: 'ASSET001',
      assetName: 'Asset 1',
      categoryId: 1,
      installedDate: new Date('2021-01-01'),
      state: ASSET_STATE.AVAILABLE,
      location: LOCATION.HCM,
      specification: 'Spec',
      isRemoved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = {
      id: 1,
      assetCode: 'ASSET001',
      assetName: 'Updated Asset',
      categoryId: 1,
      installedDate: new Date('2022-01-01'),
      state: ASSET_STATE.NOT_AVAILABLE,
      location: LOCATION.HCM,
      specification: 'Updated Spec',
      isRemoved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    it('should update an asset successfully', async () => {
      const updateAssetInput: UpdateAssetInput = {
        assetName: 'Updated Asset',
        installedDate: '2022-01-01',
        state: ASSET_STATE.NOT_AVAILABLE,
        specification: 'Updated Spec',
      };

      jest
        .spyOn(prismaService.asset, 'findUnique')
        .mockResolvedValue(existingAsset);
      jest.spyOn(prismaService.asset, 'update').mockResolvedValue({
        ...existingAsset,
        ...updateAssetInput,
        installedDate: new Date(updateAssetInput.installedDate),
        state: ASSET_STATE.NOT_AVAILABLE,
      });

      const result = await service.update(1, updateAssetInput, LOCATION.HCM);
      expect(result).toEqual({
        ...existingAsset,
        ...updateAssetInput,
        installedDate: new Date(updateAssetInput.installedDate).toISOString(),
      });
    });

    it.each([
      ['Asset not found', null],
      [
        'Asset not found in your location',
        { ...existingAsset, location: LOCATION.HN },
      ],
    ])(
      'should throw an error if asset is not found or in a different location: %s',
      async (errorMsg, asset) => {
        jest.spyOn(prismaService.asset, 'findUnique').mockResolvedValue(asset);

        const updateAssetInput: UpdateAssetInput = {
          assetName: 'Updated Asset',
          installedDate: '2022-01-01',
          state: ASSET_STATE.NOT_AVAILABLE,
          specification: 'Updated Spec',
        };

        await expect(
          service.update(1, updateAssetInput, LOCATION.HCM),
        ).rejects.toThrow(new MyBadRequestException(errorMsg));
      },
    );

    it.each([
      ['Installed date is invalid', { installedDate: '' }],
      ['State is invalid', { state: '' }],
      ['Asset name is invalid', { assetName: '' }],
    ])(
      'should throw an error for invalid input: %s',
      async (errorMsg, invalidInput) => {
        jest
          .spyOn(prismaService.asset, 'findUnique')
          .mockResolvedValue(existingAsset);

        const updateAssetInput: UpdateAssetInput = {
          assetName: 'Updated Asset',
          installedDate: '2022-01-01',
          state: ASSET_STATE.NOT_AVAILABLE,
          specification: 'Updated Spec',
          ...invalidInput,
        };

        await expect(
          service.update(1, updateAssetInput, LOCATION.HCM),
        ).rejects.toThrow(new MyBadRequestException(errorMsg));
      },
    );

    it('should throw an error if asset is assigned', async () => {
      const assignedAsset = { ...existingAsset, state: ASSET_STATE.ASSIGNED };

      jest
        .spyOn(prismaService.asset, 'findUnique')
        .mockResolvedValue(assignedAsset);

      const updateAssetInput: UpdateAssetInput = {
        assetName: 'Updated Asset',
        installedDate: '2022-01-01',
        state: ASSET_STATE.NOT_AVAILABLE,
        specification: 'Updated Spec',
      };

      await expect(
        service.update(1, updateAssetInput, LOCATION.HCM),
      ).rejects.toThrow(
        new MyBadRequestException('Can not edit ! Asset is assigned to user'),
      );
    });

    it('should do nothing where no updates are needed', async () => {
      jest
        .spyOn(prismaService.asset, 'findUnique')
        .mockResolvedValue(existingAsset);

      const updateAssetInput: UpdateAssetInput = {
        assetName: 'Asset 1',
        installedDate: '2021-01-01',
        state: ASSET_STATE.AVAILABLE,
        specification: 'Spec',
      };

      jest
        .spyOn(prismaService.asset, 'update')
        .mockResolvedValue(existingAsset);

      const result = await service.update(1, updateAssetInput, LOCATION.HCM);

      expect(result).toEqual({
        ...existingAsset,
        installedDate: existingAsset.installedDate.toISOString(),
      });
    });

    it('should update an asset successfully with specification from updateAssetInput', async () => {
      const updateAssetInput: UpdateAssetInput = {
        assetName: 'Updated Asset',
        installedDate: '2022-01-01',
        state: ASSET_STATE.NOT_AVAILABLE,
        specification: 'Updated Spec', // Ensure this is defined
      };

      jest
        .spyOn(prismaService.asset, 'findUnique')
        .mockResolvedValue(existingAsset);
      jest.spyOn(prismaService.asset, 'update').mockResolvedValue(result);

      const updatedAsset = await service.update(
        1,
        updateAssetInput,
        LOCATION.HCM,
      );

      expect(updatedAsset).toEqual({
        ...result,
        installedDate: result.installedDate.toISOString(),
      });
    });

    it('should update an asset successfully with specification from asset', async () => {
      const updateAssetInput: UpdateAssetInput = {
        assetName: 'Updated Asset',
        installedDate: '2022-01-01',
        state: ASSET_STATE.NOT_AVAILABLE,
        specification: undefined,
      };

      jest
        .spyOn(prismaService.asset, 'findUnique')
        .mockResolvedValue(existingAsset);
      jest.spyOn(prismaService.asset, 'update').mockResolvedValue(result);

      const updatedAsset = await service.update(
        1,
        updateAssetInput,
        LOCATION.HCM,
      );

      expect(updatedAsset).toEqual({
        ...result,
        installedDate: result.installedDate.toISOString(),
      });
    });
  });

  describe('findAssets', () => {
    it('should find assets successfully with stateFilter and categoryFilter', async () => {
      const findAssetsInput: FindAssetsInput = {
        page: 1,
        limit: 10,
        query: 'Asset',
        sortField: 'assetCode',
        sortOrder: 'asc',
        stateFilter: ['AVAILABLE'],
        categoryFilter: ['1'],
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
      });
    });

    it('should find assets successfully without filters', async () => {
      const findAssetsInput: FindAssetsInput = {
        page: 1,
        limit: 10,
        sortField: '',
        stateFilter: [],
        categoryFilter: [],
        query: '',
        sortOrder: 'asc',
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
      });
    });

    it('should handle errors while finding assets', async () => {
      const findAssetsInput: FindAssetsInput = {
        page: 1,
        limit: 10,
        sortField: '',
        stateFilter: [],
        categoryFilter: [],
        query: '',
        sortOrder: 'asc',
      };

      jest
        .spyOn(prismaService.asset, 'count')
        .mockRejectedValue(new Error('DB error'));
      jest
        .spyOn(prismaService.asset, 'findMany')
        .mockRejectedValue(new Error('DB error'));

      await expect(
        service.findAssets(findAssetsInput, LOCATION.HCM),
      ).rejects.toThrow(new MyBadRequestException('Error finding assets'));
    });

    it('should return an empty array if no assets match the filters', async () => {
      const findAssetsInput: FindAssetsInput = {
        page: 1,
        limit: 10,
        query: 'NonExistingAsset',
        sortField: 'assetCode',
        sortOrder: 'asc',
        stateFilter: ['AVAILABLE'],
        categoryFilter: ['1'],
      };

      jest.spyOn(prismaService.asset, 'count').mockResolvedValue(0);
      jest.spyOn(prismaService.asset, 'findMany').mockResolvedValue([]);

      const result = await service.findAssets(findAssetsInput, LOCATION.HCM);

      expect(result).toEqual({
        assets: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    });
  });

  describe('findOne', () => {
    const existingAsset = {
      id: 1,
      assetCode: 'ASSET001',
      assetName: 'Asset 1',
      categoryId: 1,
      installedDate: new Date('2021-01-01'),
      state: ASSET_STATE.AVAILABLE,
      location: LOCATION.HCM,
      specification: 'Spec',
      isRemoved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should find one asset successfully', async () => {
      jest
        .spyOn(prismaService.asset, 'findUnique')
        .mockResolvedValue(existingAsset);

      const result = await service.findOne(1, LOCATION.HCM);
      expect(result).toEqual({
        ...existingAsset,
        installedDate: existingAsset.installedDate.toISOString(),
      });
    });

    it('should throw an error if asset is not found in the location', async () => {
      const assetInDifferentLocation = {
        ...existingAsset,
        location: LOCATION.HN,
      };

      jest
        .spyOn(prismaService.asset, 'findUnique')
        .mockResolvedValue(assetInDifferentLocation);

      await expect(service.findOne(1, LOCATION.HCM)).rejects.toThrow(
        new MyBadRequestException('Asset not found in your location'),
      );
    });

    it('should throw an error if asset is not found', async () => {
      jest.spyOn(prismaService.asset, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne(1, LOCATION.HCM)).rejects.toThrow(
        new MyBadRequestException('Asset not found'),
      );
    });
  });

  describe('generateAssetCode', () => {
    it('should generate a new asset code', async () => {
      const prefix = 'CAT';
      jest.spyOn(categoriesService, 'getPrefixById').mockResolvedValue(prefix);
      jest.spyOn(prismaService.asset, 'findFirst').mockResolvedValue({
        id: 1,
        assetCode: 'CAT000001',
      } as any);

      const result = await service.generateAssetCode(1);
      expect(result).toEqual('CAT000002');
    });

    it('should generate a new asset code if no previous assets', async () => {
      const prefix = 'CAT';
      jest.spyOn(categoriesService, 'getPrefixById').mockResolvedValue(prefix);
      jest.spyOn(prismaService.asset, 'findFirst').mockResolvedValue(null);

      const result = await service.generateAssetCode(1);
      expect(result).toEqual('CAT000001');
    });
  });
});
