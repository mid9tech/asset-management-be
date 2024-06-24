import { Injectable } from '@nestjs/common';
import { CreateAssetInput } from './dto/create-asset.input';
import { UpdateAssetInput } from './dto/update-asset.input';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { ASSIGNMENT_STATE } from 'src/shared/enums';
import { MyBadRequestException } from 'src/shared/exceptions';

@Injectable()
export class AssetsService {
  constructor(private readonly prismaService: PrismaService) {}
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

  async remove(id: number) {
    try {
      // check if asset had any historical assignments
      const notNeverAssign = await this.prismaService.assignment.findFirst({
        where: {
          assetId: id,
          state: ASSIGNMENT_STATE.ACCEPTED,
        },
      });

      if (notNeverAssign) {
        throw new MyBadRequestException('Asset has historical assignments');
      }

      await this.prismaService.asset.update({
        where: { id },
        data: {
          isRemoved: true,
        },
      });

      return true;
    } catch (error) {
      return error;
    }
  }
}
