import { Test, TestingModule } from '@nestjs/testing';
import { AssetsResolver } from './assets.resolver';
import { AssetsService } from './assets.service';
import { CategoriesService } from '../categories/categories.service';
import { CreateAssetInput } from './dto/create-asset.input';
import { Asset } from './entities/asset.entity';
import { FindAssetsInput } from './dto/find-assets.input';
import { FindAssetsOutput } from './dto/find-assets.output';
import { UpdateAssetInput } from './dto/update-asset.input';
import {
  USER_TYPE,
  LOCATION,
  ASSET_STATE,
  USER_FIRST_LOGIN,
} from 'src/shared/enums';
import { CurrentUserInterface } from 'src/shared/generics';
import { MyBadRequestException } from 'src/shared/exceptions';
import { RoleGuard } from 'src/common/guard/role.guard';
import { JwtAccessAuthGuard } from 'src/common/guard/jwt.guard';

describe('AssetsResolver', () => {
  let resolver: AssetsResolver;
  let assetsService: AssetsService;
  let categoriesService: CategoriesService;

  const mockCurrentUser: CurrentUserInterface = {
    id: 1,
    username: 'testuser',
    type: USER_TYPE.ADMIN,
    location: LOCATION.HCM,
    firstName: 'Test',
    lastName: 'User',
    staffCode: 'STF001',
    state: USER_FIRST_LOGIN.FALSE,
    joinedDate: '2021-01-01',
  };

  const mockAsset: Asset = {
    id: 1,
    assetCode: 'CAT000001',
    assetName: 'Asset 1',
    categoryId: 1,
    installedDate: new Date('2021-01-01').toISOString(),
    state: ASSET_STATE.AVAILABLE,
    location: LOCATION.HCM,
    specification: 'Spec',
  };

  const mockFindAssetsOutput: FindAssetsOutput = {
    assets: [mockAsset],
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
  };

  const mockCategory = {
    id: 1,
    name: 'Category 1',
    prefix: 'CAT',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsResolver,
        {
          provide: AssetsService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockAsset),
            findAssets: jest.fn().mockResolvedValue(mockFindAssetsOutput),
            findOne: jest.fn().mockResolvedValue(mockAsset),
            update: jest
              .fn()
              .mockImplementation((id, updateAssetInput, location) => {
                if (
                  !updateAssetInput.assetName ||
                  !updateAssetInput.installedDate ||
                  !updateAssetInput.state
                ) {
                  throw new MyBadRequestException('Invalid input');
                }
                if (!id) {
                  throw new MyBadRequestException('Invalid id');
                }
                if (!location) {
                  throw new MyBadRequestException('Invalid location');
                }
                if (location !== mockAsset.location) {
                  throw new MyBadRequestException('Invalid location');
                }
                return Promise.resolve(mockAsset);
              }),
          },
        },
        {
          provide: CategoriesService,
          useValue: {
            findById: jest.fn().mockResolvedValue(mockCategory),
          },
        },
      ],
    }).compile();

    resolver = module.get<AssetsResolver>(AssetsResolver);
    assetsService = module.get<AssetsService>(AssetsService);
    categoriesService = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createAsset', () => {
    it('should create an asset', async () => {
      const createAssetInput: CreateAssetInput = {
        assetName: 'Asset 1',
        categoryId: 1,
        installedDate: '2021-01-01',
        state: ASSET_STATE.AVAILABLE,
        specification: 'Spec',
      };

      const result = await resolver.createAsset(
        createAssetInput,
        mockCurrentUser,
      );
      expect(result).toEqual(mockAsset);
      expect(assetsService.create).toHaveBeenCalledWith(
        createAssetInput,
        mockCurrentUser.location,
      );
    });

    it('should throw an exception when create fails', async () => {
      const createAssetInput: CreateAssetInput = {
        assetName: 'Asset 1',
        categoryId: 1,
        installedDate: '2021-01-01',
        state: ASSET_STATE.AVAILABLE,
        specification: 'Spec',
      };
      jest
        .spyOn(assetsService, 'create')
        .mockRejectedValueOnce(
          new MyBadRequestException('Error creating asset'),
        );

      await expect(
        resolver.createAsset(createAssetInput, mockCurrentUser),
      ).rejects.toThrow(MyBadRequestException);
    });
  });

  describe('getAssets', () => {
    it('should find assets', async () => {
      const findAssetsInput: FindAssetsInput = {
        page: 1,
        limit: 10,
        query: 'Asset',
        sortField: 'assetCode',
        sortOrder: 'asc',
        stateFilter: ['AVAILABLE'],
        categoryFilter: ['1'],
      };

      const result = await resolver.getAssets(mockCurrentUser, findAssetsInput);
      expect(result).toEqual(mockFindAssetsOutput);
      expect(assetsService.findAssets).toHaveBeenCalledWith(
        findAssetsInput,
        mockCurrentUser.location,
      );
    });

    it('should throw an exception when find fails', async () => {
      const findAssetsInput: FindAssetsInput = {
        page: 1,
        limit: 10,
        query: 'Asset',
        sortField: 'assetCode',
        sortOrder: 'asc',
        stateFilter: ['AVAILABLE'],
        categoryFilter: ['1'],
      };
      jest
        .spyOn(assetsService, 'findAssets')
        .mockRejectedValueOnce(
          new MyBadRequestException('Error finding assets'),
        );

      await expect(
        resolver.getAssets(mockCurrentUser, findAssetsInput),
      ).rejects.toThrow(MyBadRequestException);
    });
  });

  describe('findOne', () => {
    it('should find one asset', async () => {
      const result = await resolver.findOne(mockCurrentUser, 1);
      expect(result).toEqual(mockAsset);
      expect(assetsService.findOne).toHaveBeenCalledWith(
        1,
        mockCurrentUser.location,
      );
    });

    it('should throw an exception when find fails', async () => {
      jest
        .spyOn(assetsService, 'findOne')
        .mockRejectedValueOnce(
          new MyBadRequestException('Error finding asset'),
        );

      await expect(resolver.findOne(mockCurrentUser, 1)).rejects.toThrow(
        MyBadRequestException,
      );
    });
  });

  describe('updateAsset', () => {
    it('should update an asset', async () => {
      const updateAssetInput: UpdateAssetInput = {
        assetName: 'Updated Asset Name',
        installedDate: '2022-01-01',
        state: ASSET_STATE.NOT_AVAILABLE,
        specification: 'Updated Spec',
      };

      const result = await resolver.updateAsset(
        1,
        updateAssetInput,
        mockCurrentUser,
      );
      expect(result).toEqual(mockAsset);
      expect(assetsService.update).toHaveBeenCalledWith(
        1,
        updateAssetInput,
        mockCurrentUser.location,
      );
    });

    it('should throw MyBadRequestException on invalid input', async () => {
      const invalidUpdateAssetInput: UpdateAssetInput = {
        assetName: '',
        installedDate: 'invalid-date',
        state: '',
        specification: '',
      };

      await expect(
        resolver.updateAsset(1, invalidUpdateAssetInput, mockCurrentUser),
      ).rejects.toThrow(MyBadRequestException);
    });

    it('should throw an exception when update fails', async () => {
      const updateAssetInput: UpdateAssetInput = {
        assetName: 'Updated Asset Name',
        installedDate: '2022-01-01',
        state: ASSET_STATE.NOT_AVAILABLE,
        specification: 'Updated Spec',
      };
      jest
        .spyOn(assetsService, 'update')
        .mockRejectedValueOnce(
          new MyBadRequestException('Error updating asset'),
        );

      await expect(
        resolver.updateAsset(1, updateAssetInput, mockCurrentUser),
      ).rejects.toThrow(MyBadRequestException);
    });
  });

  describe('category', () => {
    it('should resolve category field', async () => {
      const result = await resolver.category(mockAsset);
      expect(result).toEqual(mockCategory);
      expect(categoriesService.findById).toHaveBeenCalledWith(
        mockAsset.categoryId,
      );
    });

    it('should throw an exception when category resolution fails', async () => {
      jest
        .spyOn(categoriesService, 'findById')
        .mockRejectedValueOnce(
          new MyBadRequestException('Error finding category'),
        );

      await expect(resolver.category(mockAsset)).rejects.toThrow(
        MyBadRequestException,
      );
    });
  });

  describe('Guards', () => {
    it('should apply guards to createAsset', async () => {
      const guards = Reflect.getMetadata('__guards__', resolver.createAsset);
      expect(guards).toHaveLength(2);
      expect(guards[0]).toBe(JwtAccessAuthGuard);
      expect(guards[1]).toBe(RoleGuard);
    });

    it('should apply guards to updateAsset', async () => {
      const guards = Reflect.getMetadata('__guards__', resolver.updateAsset);
      expect(guards).toHaveLength(2);
      expect(guards[0]).toBe(JwtAccessAuthGuard);
      expect(guards[1]).toBe(RoleGuard);
    });
  });
});
