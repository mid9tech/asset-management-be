import { InputType, Field, Int } from '@nestjs/graphql';
import { IsEnum } from 'class-validator';
import { ASSIGNMENT_STATE } from 'src/shared/enums';

@InputType()
export class UpdateAssignmentInput {
  @Field({ nullable: true })
  assetCode: string;

  @Field({ nullable: true })
  assetName: string;

  @Field(() => Int, { nullable: true })
  assignedToId: number;

  @Field({ nullable: true })
  assignedToUsername: string;

  @Field({ nullable: true })
  assignedDate: string;

  @Field({ nullable: true })
  note: string;

  @Field(() => Int, { nullable: true })
  assetId: number;
}

@InputType()
export class UpdateStatusAssignmentInput {
  @Field(() => Int)
  id: number;

  @Field({ description: 'assignment status' })
  @IsEnum(ASSIGNMENT_STATE)
  state: ASSIGNMENT_STATE;
}
