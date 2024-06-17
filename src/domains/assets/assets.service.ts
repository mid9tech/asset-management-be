import { Injectable } from '@nestjs/common';
import { CreateAssetInput } from './dto/create-asset.input';
import { UpdateAssetInput } from './dto/update-asset.input';

@Injectable()
export class AssetsService {
  create(createAssetInput: CreateAssetInput) {
    return `${createAssetInput}`;
  }

  findAll() {
    return `This action returns all assets`;
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
}
