import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Category {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  categoryName: string;

  @Field(() => String)
  categoryCode: string;
}
