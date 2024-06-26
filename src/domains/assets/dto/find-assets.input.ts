import { Field, InputType } from '@nestjs/graphql';
import { BasePagingRequest } from 'src/shared/generics';

@InputType()
export class FindAssetsInput extends BasePagingRequest {
  @Field({ nullable: true, defaultValue: 'assetCode' })
  sortField: string;

  @Field({ nullable: true })
  stateFilter: string;

  @Field({ nullable: true })
  categoryFilter: string;
}
