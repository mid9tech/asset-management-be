import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { AssetsService } from './assets.service';
import { Asset } from './entities/asset.entity';
import { CreateAssetInput } from './dto/create-asset.input';

import { CurrentUser, JwtAccessAuthGuard } from 'src/common/guard/jwt.guard';
import { CurrentUserInterface } from 'src/shared/generics';
import { Roles } from 'src/common/decorator/roles.decorator';
import { USER_TYPE } from '@prisma/client';
import { UseGuards } from '@nestjs/common';
import { RoleGuard } from 'src/common/guard/role.guard';

import { CategoriesService } from '../categories/categories.service';
import { FindAssetsInput } from './dto/find-assets.input';
import { UpdateAssetInput } from './dto/update-asset.input';
import { returningAsset, returningFindAssetsOutput } from './returns';
import { returningInt } from 'src/shared/constants';
import { returningCategory } from '../categories/returns';

@Resolver(() => Asset)
export class AssetsResolver {
  constructor(
    private readonly assetsService: AssetsService,
    private readonly categoryService: CategoriesService,
  ) {}

  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Mutation(returningAsset)
  async createAsset(
    @Args('createAssetInput') createAssetInput: CreateAssetInput,
    @CurrentUser() userReq: CurrentUserInterface,
  ) {
    return await this.assetsService.create(createAssetInput, userReq.location);
  }

  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Mutation(returningAsset)
  async updateAsset(
    @Args('id', { type: returningInt }) id: number,
    @Args('updateAssetInput') updateAssetInput: UpdateAssetInput,
    @CurrentUser() userReq: CurrentUserInterface,
  ) {
    return await this.assetsService.update(
      id,
      updateAssetInput,
      userReq.location,
    );
  }

  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Query(returningFindAssetsOutput, { name: 'findAssets' })
  async getAssets(
    @CurrentUser() userReq: CurrentUserInterface,
    @Args('request') request: FindAssetsInput,
  ) {
    const location = userReq.location;
    return this.assetsService.findAssets(request, location);
  }

  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Query(returningAsset, { name: 'findOneAsset' })
  async findOne(
    @CurrentUser() userReq: CurrentUserInterface,
    @Args('id', { type: returningInt }) id: number,
  ) {
    const location = userReq.location;
    return await this.assetsService.findOne(id, location);
  }

  @ResolveField(returningCategory)
  async category(@Parent() asset: Asset) {
    return await this.categoryService.findById(asset.categoryId);
  }

  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Mutation(returningAsset, { name: 'deleteAsset' })
  async removeAsset(
    @Args('id', { type: returningInt }) id: number,
    @CurrentUser() userReq: CurrentUserInterface,
  ) {
    return await this.assetsService.remove(id, userReq.location);
  }
}
