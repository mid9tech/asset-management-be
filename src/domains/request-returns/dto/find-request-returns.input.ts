import { Field, InputType } from '@nestjs/graphql';
import { REQUEST_RETURN_STATE } from 'src/shared/enums';

import { BasePagingRequest } from 'src/shared/generics';

@InputType()
export class FindRequestReturnsInput extends BasePagingRequest {
  @Field({ nullable: true, defaultValue: 'id' })
  sortField: string;

  @Field(() => [String], { nullable: true })
  stateFilter: REQUEST_RETURN_STATE[];

  @Field({ nullable: true })
  returnedDateFilter: string;
}
