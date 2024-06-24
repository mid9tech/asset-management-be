import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateCategoryInput {
  @Field(() => String)
  categoryName: string;

  @Field(() => String)
  categoryCode: string;
}
