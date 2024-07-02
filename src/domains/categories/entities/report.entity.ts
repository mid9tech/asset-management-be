import { Field, Int, ObjectType } from '@nestjs/graphql';
import { BasePagingResponse } from 'src/shared/generics';

@ObjectType()
export class ReportElement {
  @Field()
  categoryName: string;

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  assigned: number;

  @Field(() => Int)
  available: number;

  @Field(() => Int)
  notAvailable: number;

  @Field(() => Int)
  waitingForRecycling: number;

  @Field(() => Int)
  recycled: number;
}

@ObjectType()
export class ReportResponse extends BasePagingResponse {
  @Field(() => [ReportElement])
  data: ReportElement[];
}
