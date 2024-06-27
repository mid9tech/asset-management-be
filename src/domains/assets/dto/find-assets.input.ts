import { Field, InputType } from '@nestjs/graphql';
import { BasePagingRequest } from 'src/shared/generics';

@InputType()
export class FindAssetsInput extends BasePagingRequest {
  @Field({ nullable: true, defaultValue: 'assetCode' })
  sortField: string;

  @Field(() => [String], { nullable: true })
  stateFilter: string[];

  @Field(() => [String], { nullable: true })
  categoryFilter: string[];
}
