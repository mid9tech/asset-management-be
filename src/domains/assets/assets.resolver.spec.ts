import { Test, TestingModule } from '@nestjs/testing';
import { AssetsResolver } from './assets.resolver';
import { AssetsService } from './assets.service';
import { CategoriesService } from '../categories/categories.service';
import { CreateAssetInput } from './dto/create-asset.input';
import { UpdateAssetInput } from './dto/update-asset.input';
import { USER_TYPE, LOCATION, ASSET_STATE } from 'src/shared/enums';
import { CurrentUserInterface } from 'src/shared/generics';

import { JwtAccessAuthGuard } from 'src/common/guard/jwt.guard';
import { RoleGuard } from 'src/common/guard/role.guard';

describe('AssetsResolver', () => {
  let resolver: AssetsResolver;
  let assetsService: AssetsService;
  let categoriesService: CategoriesService;

  const mockAssetsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockCategoriesService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsResolver,
        { provide: AssetsService, useValue: mockAssetsService },
        { provide: CategoriesService, useValue: mockCategoriesService },
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
    it('should create a new asset', async () => {
      const createAssetInput: CreateAssetInput = {
        assetName: 'Asset1',
        categoryId: 1,
        installedDate: '2023-01-01',
        state: ASSET_STATE.AVAILABLE,
        specification: '',
      };
      const userReq: CurrentUserInterface = {
        id: 1,
        location: LOCATION.HCM,
        type: USER_TYPE.ADMIN,
        firstName: '',
        staffCode: '',
        lastName: '',
        state: false,
        username: '',
        joinedDate: '',
      };

      const asset = {
        id: 1,
        ...createAssetInput,
        assetCode: 'ABC123',
        location: userReq.location,
        specification: 'Some specification',
        state: ASSET_STATE.AVAILABLE,
      };
      mockAssetsService.create.mockResolvedValue(asset);

      const result = await resolver.createAsset(createAssetInput, userReq);
      expect(result).toEqual(asset);
      expect(assetsService.create).toHaveBeenCalledWith(
        createAssetInput,
        userReq.location,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of assets', async () => {
      const assets = [
        {
          id: 1,
          assetName: 'Asset1',
          categoryId: 1,
          installedDate: '2023-01-01',
          state: ASSET_STATE.AVAILABLE,
        },
      ];
      mockAssetsService.findAll.mockResolvedValue(assets);

      const result = await resolver.findAll();
      expect(result).toEqual(assets);
      expect(assetsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single asset', async () => {
      const asset = {
        id: 1,
        assetName: 'Asset1',
        categoryId: 1,
        installedDate: '2023-01-01',
        state: ASSET_STATE.AVAILABLE,
        assetCode: 'ABC123',
        location: LOCATION.HCM,
        specification: 'Some specification',
      };
      mockAssetsService.findOne.mockResolvedValue(asset);

      const result = await resolver.findOne(1);
      expect(result).toEqual(asset);
      expect(assetsService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('updateAsset', () => {
    it('should update an asset', async () => {
      const updateAssetInput: UpdateAssetInput = {
        id: 1,
        assetName: 'Updated Asset',
      };
      const asset = {
        id: 1,
        ...updateAssetInput,
        categoryId: 1,
        installedDate: '2023-01-01',
        state: ASSET_STATE.AVAILABLE,
      };
      mockAssetsService.update.mockResolvedValue(asset);

      const result = await resolver.updateAsset(updateAssetInput);
      expect(result).toEqual(asset);
      expect(assetsService.update).toHaveBeenCalledWith(
        updateAssetInput.id,
        updateAssetInput,
      );
    });
  });

  describe('removeAsset', () => {
    it('should remove an asset', async () => {
      const asset = {
        id: 1,
        assetName: 'Asset1',
        categoryId: 1,
        installedDate: '2023-01-01',
        state: ASSET_STATE.AVAILABLE,
        assetCode: 'ABC123',
        location: LOCATION.HCM,
        specification: 'Some specification',
      };
      mockAssetsService.remove.mockResolvedValue(asset);

      const result = await resolver.removeAsset(1);
      expect(result).toEqual(asset);
      expect(assetsService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('category', () => {
    it('should return the category of the asset', async () => {
      const category = { id: 1, categoryName: 'Category1' };
      mockCategoriesService.findById.mockResolvedValue(category);

      const asset = {
        id: 1,
        assetName: 'Asset1',
        categoryId: 1,
        installedDate: '2023-01-01',
        state: ASSET_STATE.AVAILABLE,
        assetCode: 'ABC123',
        location: LOCATION.HCM,
        specification: 'Some specification',
      };
      const result = await resolver.category(asset);
      expect(result).toEqual(category);
      expect(categoriesService.findById).toHaveBeenCalledWith(asset.categoryId);
    });
  });
});
