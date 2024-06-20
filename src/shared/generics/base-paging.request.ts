import { Field, Int, InputType } from '@nestjs/graphql';

@InputType()
export class BasePagingRequest {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  page: number;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  limit: number;

  @Field(() => String, { nullable: true })
  query: string;

  @Field(() => String, { nullable: true, defaultValue: 'asc' })
  sortOrder: 'asc' | 'desc';
}
