import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class ReportInput {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  page: number;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  limit: number;

  @Field(() => String, { nullable: true, defaultValue: 'asc' })
  sortOrder: 'asc' | 'desc';

  @Field(() => String, { nullable: true, defaultValue: 'categoryName' })
  sort: string;
}
