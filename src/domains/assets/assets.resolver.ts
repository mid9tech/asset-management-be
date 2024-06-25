import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
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
import { FindAssetsOutput } from './dto/find-assets.output';

@Resolver(() => Asset)
export class AssetsResolver {
  constructor(
    private readonly assetsService: AssetsService,
    private readonly categoryService: CategoriesService,
  ) {}
  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Mutation(() => Asset)
  createAsset(
    @Args('createAssetInput') createAssetInput: CreateAssetInput,
    @CurrentUser() userReq: CurrentUserInterface,
  ) {
    return this.assetsService.create(createAssetInput, userReq.location);
  }

  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Query(() => FindAssetsOutput, { name: 'findAssets' })
  async getAssets(
    @CurrentUser() userReq: CurrentUserInterface,
    @Args('request') request: FindAssetsInput,
  ) {
    const location = userReq.location;
    return this.assetsService.findAssets(request, location);
  }

  @Roles(USER_TYPE.ADMIN)
  @UseGuards(JwtAccessAuthGuard, RoleGuard)
  @Query(() => Asset, { name: 'findOneAsset' })
  findOne(
    @CurrentUser() userReq: CurrentUserInterface,
    @Args('id', { type: () => Int }) id: number,
  ) {
    const location = userReq.location;
    return this.assetsService.findOne(id, location);
  }
}
