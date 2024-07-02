import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class ReportInput {
  @Field(() => Int, { nullable: true })
  page: number;

  @Field(() => Int, { nullable: true })
  limit: number;

  @Field(() => String, { nullable: true, defaultValue: 'asc' })
  sortOrder: 'asc' | 'desc';

  @Field(() => String, { nullable: true, defaultValue: 'category_name' })
  sort: string;
}
