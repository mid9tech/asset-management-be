import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { AssetsService } from './assets.service';
import { Asset } from './entities/asset.entity';
import { CreateAssetInput } from './dto/create-asset.input';
import { UpdateAssetInput } from './dto/update-asset.input';
import { CurrentUser, JwtAccessAuthGuard } from 'src/common/guard/jwt.guard';
import { CurrentUserInterface } from 'src/shared/generics';
import { Roles } from 'src/common/decorator/roles.decorator';
import { USER_TYPE } from '@prisma/client';
import { UseGuards } from '@nestjs/common';
import { RoleGuard } from 'src/common/guard/role.guard';
import { Category } from '../categories/entities/category.entity';
import { CategoriesService } from '../categories/categories.service';

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

  @Query(() => [Asset], { name: 'getAllAssets' })
  findAll() {
    return this.assetsService.findAll();
  }

  @Query(() => Asset, { name: 'asset' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.assetsService.findOne(id);
  }

  @Mutation(() => Asset)
  updateAsset(@Args('updateAssetInput') updateAssetInput: UpdateAssetInput) {
    return this.assetsService.update(updateAssetInput.id, updateAssetInput);
  }

  @Mutation(() => Asset)
  removeAsset(@Args('id', { type: () => Int }) id: number) {
    return this.assetsService.remove(id);
  }

  @ResolveField(() => Category)
  category(@Parent() asset: Asset) {
    return this.categoryService.findById(asset.categoryId);
  }
}
