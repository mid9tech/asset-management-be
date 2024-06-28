import { Injectable } from '@nestjs/common';
import { CreateAssetInput } from './dto/create-asset.input';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { LOCATION, ASSET_STATE } from 'src/shared/enums';
import { MyBadRequestException } from 'src/shared/exceptions';
import { CategoriesService } from '../categories/categories.service';
import { FindAssetsInput } from './dto/find-assets.input';
import { Prisma } from '@prisma/client';
import { FindAssetsOutput } from './dto/find-assets.output';
import { UpdateAssetInput } from './dto/update-asset.input';

@Injectable()
export class AssetsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly categoryService: CategoriesService,
  ) {}

  async create(createAssetInput: CreateAssetInput, location: LOCATION) {
    const { assetName, categoryId, installedDate, state } = createAssetInput;

    if (assetName === '') {
      throw new MyBadRequestException('Asset name is invalid');
    }

    if (categoryId === 0) {
      throw new MyBadRequestException('Category is invalid');
    }

    if (isNaN(Date.parse(installedDate))) {
      throw new MyBadRequestException('Installed date is invalid');
    }

    if (state === '') {
      throw new MyBadRequestException('State is invalid');
    }

    const assetCode = await this.generateAssetCode(categoryId);

    const result = await this.prismaService.asset.create({
      data: {
        ...createAssetInput,
        installedDate: new Date(installedDate).toISOString(),
        assetCode: assetCode,
        location: location,
        state: ASSET_STATE[state],
      },
    });
    return result;
  }

  async update(
    id: number,
    updateAssetInput: UpdateAssetInput,
    location: LOCATION,
  ) {
    const asset = await this.prismaService.asset.findUnique({
      where: { id },
    });
    if (!asset) {
      throw new MyBadRequestException('Asset not found');
    }
    if (asset.location !== location) {
      throw new MyBadRequestException('Asset not found in your location');
    }
    if (updateAssetInput.installedDate === '') {
      throw new MyBadRequestException('Installed date is invalid');
    }
    if (updateAssetInput.state === '') {
      throw new MyBadRequestException('State is invalid');
    }
    if (updateAssetInput.assetName === '') {
      throw new MyBadRequestException('Asset name is invalid');
    }

    if (
      updateAssetInput.state === ASSET_STATE.ASSIGNED ||
      asset.state === ASSET_STATE.ASSIGNED
    ) {
      throw new MyBadRequestException(
        'Can not edit ! Asset is assigned to user',
      );
    }
    const updateData = {
      ...updateAssetInput,
      installedDate: new Date(updateAssetInput.installedDate).toISOString(),
      state: ASSET_STATE[updateAssetInput.state],
      specification: updateAssetInput.specification || asset.specification,
    };
    const result = await this.prismaService.asset.update({
      where: { id },
      data: updateData,
    });
    const mappedResult = {
      ...result,
      installedDate: result.installedDate.toISOString(),
    };
    return mappedResult;
  }

  async findAssets(request: FindAssetsInput, location: LOCATION) {
    const {
      page = 1,
      limit = 20,
      query,
      sortField = 'assetCode',
      sortOrder = 'asc',
      stateFilter,
      categoryFilter,
    } = request;

    const where: Prisma.AssetWhereInput = {};

    if (query) {
      where.OR = [
        { assetCode: { contains: query, mode: 'insensitive' } },
        { assetName: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (location) {
      where.location = location;
    }

    if (stateFilter) {
      where.state = { in: stateFilter.map((state) => ASSET_STATE[state]) };
    }

    if (categoryFilter) {
      where.categoryId = { in: categoryFilter.map((id) => parseInt(id)) };
    }

    try {
      const total = await this.prismaService.asset.count({ where });

      const orderBy = sortField.includes('category')
        ? { category: { categoryName: sortOrder } }
        : { [sortField]: sortOrder };

      const assets = await this.prismaService.asset.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      });

      const totalPages = Math.ceil(total / limit);

      const result = new FindAssetsOutput();
      result.assets = assets.map((asset) => ({
        ...asset,
        installedDate: asset.installedDate.toISOString(),
      }));
      result.page = page;
      result.limit = limit;
      result.total = total;
      result.totalPages = totalPages;
      return result;
    } catch (error) {
      throw new MyBadRequestException('Error finding assets');
    }
  }

  async findOne(id: number, location: LOCATION) {
    const asset = await this.prismaService.asset.findUnique({
      where: { id },
    });
    if (!asset) {
      throw new MyBadRequestException('Asset not found');
    }
    if (asset.location !== location) {
      throw new MyBadRequestException('Asset not found in your location');
    }
    const result = {
      ...asset,
      installedDate: asset.installedDate.toISOString(),
    };
    return result;
  }

  async generateAssetCode(categoryId: number) {
    const prefix = await this.categoryService.getPrefixById(categoryId);
    const lastAsset = await this.prismaService.asset.findFirst({
      orderBy: { id: 'desc' },
    });
    const stringId = lastAsset?.assetCode.slice(-6);
    const newId = lastAsset ? parseInt(stringId) + 1 : 1;
    const assetCode = `${prefix}${newId.toString().padStart(6, '0')}`;
    return assetCode;
  }
}
