import { Field, ObjectType } from '@nestjs/graphql';
import { BasePagingResponse } from 'src/shared/generics';
import { RequestReturn } from '../entities/request-return.entity';

@ObjectType()
export class FindRequestReturnsOutput extends BasePagingResponse {
  @Field(() => [RequestReturn])
  requestReturns: RequestReturn[];
}
