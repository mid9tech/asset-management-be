import { FindAssetsOutput } from '../dto/find-assets.output';
import { Asset } from '../entities/asset.entity';

export const returningAsset = () => Asset;

export const returningFindAssetsOutput = () => FindAssetsOutput;
