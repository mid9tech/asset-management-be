import { ObjectType, Field, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class Asset {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  assetCode: string;

  @Field(() => String)
  assetName: string;

  @Field(() => Int)
  categoryId: number;

  @Field(() => String)
  installedDate: string;

  @Field(() => String)
  state: string;

  @Field(() => String)
  location: string;

  @Field(() => String)
  specification: string;
}
