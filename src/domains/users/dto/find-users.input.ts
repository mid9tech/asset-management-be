import { InputType, Field } from '@nestjs/graphql';

import { USER_TYPE } from '../../../shared/enums';
import { BasePagingRequest } from 'src/shared/generics';

@InputType()
export class FindUsersInput extends BasePagingRequest {
  @Field(() => String, { nullable: true })
  type: USER_TYPE;

  @Field(() => String, { nullable: true, defaultValue: 'firstName' })
  sort: string;
}
