import { InputType, Field, ObjectType } from '@nestjs/graphql';

import { USER_TYPE } from 'src/shared/enums';
import { BasePagingRequest, BasePagingResponse } from 'src/shared/generics';
import { User } from '../entities/user.entity';

@InputType()
export class FindUsersInput extends BasePagingRequest {
  @Field(() => [String], { nullable: true })
  type?: USER_TYPE[];

  @Field(() => String, { nullable: true, defaultValue: 'firstName' })
  sort: string;
}
@ObjectType()
export class FindUsersOutput extends BasePagingResponse {
  @Field(() => [User])
  users: User[];
}
