import { Asset } from 'src/domains/assets/entities/asset.entity';
import { ASSET_STATE, LOCATION } from '../enums';
import * as MyPrisma from '@prisma/client';

export const assetDataMock: Asset[] = [
  {
    assetCode: 'assignment1',
    assetName: 'asset',
    id: 1,
    categoryId: 1,
    installedDate: '2024-12-22T13:32:33.076Z',
    location: LOCATION.HCM,
    specification: 'assignment',
    state: ASSET_STATE.AVAILABLE,
  },
];

export const assetDatePrismaMock: MyPrisma.Asset = {
  ...assetDataMock[0],
  installedDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  isRemoved: false,
  state: ASSET_STATE.AVAILABLE,
  location: LOCATION.HCM,
};
