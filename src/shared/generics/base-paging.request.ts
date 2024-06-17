import { Field, Int, InputType } from '@nestjs/graphql';

@InputType()
export class BasePagingRequest {
  @Field(() => Int, { nullable: true })
  page: number;

  @Field(() => Int, { nullable: true })
  limit: number;
}
