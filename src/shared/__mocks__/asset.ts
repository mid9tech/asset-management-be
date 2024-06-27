import { Asset } from 'src/domains/assets/entities/asset.entity';
import { ASSET_STATE, LOCATION } from '../enums';

export const assetDataMock: Asset[] = [
  {
    assetCode: 'assignment1',
    assetName: 'asset',
    id: 1,
    categoryId: 1,
    installedDate: '2024-12-22T13:32:33.076Z',
    location: LOCATION.DN,
    specification: 'assignment',
    state: ASSET_STATE.ASSIGNED,
  },
];
