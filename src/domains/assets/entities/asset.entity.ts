import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ASSET_STATE } from 'src/shared/enums';

@ObjectType()
export class Asset {
  @Field(() => Int)
  id: number;

  @Field()
  assetCode: string;

  @Field()
  assetName: string;

  @Field()
  categoryId: number;

  @Field()
  installedDate: string;

  @Field()
  state: ASSET_STATE;

  @Field()
  location: string;
}
