import { Field, InputType } from '@nestjs/graphql';
import { ASSET_STATE } from 'src/shared/enums';
import { BasePagingRequest } from 'src/shared/generics';

@InputType()
export class FindAssetsInput extends BasePagingRequest {
  @Field({ nullable: true, defaultValue: 'assetCode' })
  sortField: string;

  @Field(() => [String], { nullable: true })
  stateFilter: ASSET_STATE[];

  @Field(() => [String], { nullable: true })
  categoryFilter: string[];
}
