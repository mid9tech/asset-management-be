import { Field, Int, ObjectType } from '@nestjs/graphql';
import { BasePagingResponse } from 'src/shared/generics';

@ObjectType()
export class ReportElement {
  @Field()
  category_name: string;

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  assigned: number;

  @Field(() => Int)
  available: number;

  @Field(() => Int)
  not_available: number;

  @Field(() => Int)
  waiting_for_recycling: number;

  @Field(() => Int)
  recycled: number;
}

@ObjectType()
export class ReportResponse extends BasePagingResponse {
  @Field(() => [ReportElement])
  data: ReportElement[];
}
