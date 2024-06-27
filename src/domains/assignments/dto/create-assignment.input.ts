import { InputType, Int, Field } from '@nestjs/graphql';
@InputType()
export class CreateAssignmentInput {
  @Field()
  assetCode: string;

  @Field()
  assetName: string;

  @Field(() => Int)
  assignedToId: number;

  @Field()
  assignedToUsername: string;

  @Field()
  assignedDate: string;

  @Field({ nullable: true })
  note: string;

  @Field(() => Int)
  assetId: number;
}
