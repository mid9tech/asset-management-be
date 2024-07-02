import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateRequestReturnInput {
  @Field(() => Int)
  assetId: number;

  @Field(() => Int)
  assignmentId: number;

  @Field(() => Int)
  requestedById: number;

  @Field(() => String)
  assignedDate: string;
}
