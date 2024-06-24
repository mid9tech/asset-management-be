import { InputType, Int, Field } from '@nestjs/graphql';
import { ASSIGNMENT_STATE } from 'src/shared/enums';

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

  @Field(() => Int)
  assignedById: number;

  @Field()
  state: ASSIGNMENT_STATE;

  @Field()
  assignedDate: string;

  @Field()
  note: string;

  @Field(() => Int)
  assetId: number;
}
