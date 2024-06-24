import { Injectable } from '@nestjs/common';
import { CreateAssetInput } from './dto/create-asset.input';
import { UpdateAssetInput } from './dto/update-asset.input';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { LOCATION, ASSET_STATE } from 'src/shared/enums';
import { MyBadRequestException } from 'src/shared/exceptions';
import { CategoriesService } from '../categories/categories.service';

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

  async findAll() {
    return this.prismaService.asset.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} asset`;
  }

  update(id: number, updateAssetInput: UpdateAssetInput) {
    return `This action updates a #${id} asset: ${updateAssetInput}`;
  }

  remove(id: number) {
    return `This action removes a #${id} asset`;
  }

  async generateAssetCode(categoryId: number) {
    const prefix = await this.categoryService.getPrefixById(categoryId);
    const lastAsset = await this.prismaService.asset.findFirst({
      orderBy: { id: 'desc' },
      where: { categoryId: categoryId },
    });
    const newId = lastAsset ? lastAsset.id + 1 : 1;
    const assetCode = `${prefix}${newId.toString().padStart(6, '0')}`;
    return assetCode;
  }
}
