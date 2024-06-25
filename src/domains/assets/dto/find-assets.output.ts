import { Field, ObjectType } from '@nestjs/graphql';
import { BasePagingResponse } from 'src/shared/generics';
import { Asset } from '../entities/asset.entity';

@ObjectType()
export class FindAssetsOutput extends BasePagingResponse {
  @Field(() => [Asset])
  assets: Asset[];
}
