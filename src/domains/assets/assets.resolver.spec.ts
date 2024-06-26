import { Test, TestingModule } from '@nestjs/testing';
import { AssetsResolver } from './assets.resolver';
import { AssetsService } from './assets.service';
import { CategoriesService } from '../categories/categories.service';
import { CreateAssetInput } from './dto/create-asset.input';
import { Asset } from './entities/asset.entity';
import { FindAssetsInput } from './dto/find-assets.input';
import { FindAssetsOutput } from './dto/find-assets.output';
import {
  USER_TYPE,
  LOCATION,
  ASSET_STATE,
  USER_FIRST_LOGIN,
} from 'src/shared/enums';
import { CurrentUserInterface } from 'src/shared/generics';

describe('AssetsResolver', () => {
  let resolver: AssetsResolver;
  let assetsService: AssetsService;
  // let categoriesService: CategoriesService;

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
          },
        },
        {
          provide: CategoriesService,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<AssetsResolver>(AssetsResolver);
    assetsService = module.get<AssetsService>(AssetsService);
    // categoriesService = module.get<CategoriesService>(CategoriesService);
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
  });

  describe('getAssets', () => {
    it('should find assets', async () => {
      const findAssetsInput: FindAssetsInput = {
        page: 1,
        limit: 10,
        query: 'Asset',
        sortField: 'assetCode',
        sortOrder: 'asc',
        stateFilter: 'AVAILABLE',
        categoryFilter: '1',
      };

      const result = await resolver.getAssets(mockCurrentUser, findAssetsInput);
      expect(result).toEqual(mockFindAssetsOutput);
      expect(assetsService.findAssets).toHaveBeenCalledWith(
        findAssetsInput,
        mockCurrentUser.location,
      );
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
  });
});
