import { InputType, Field, ObjectType } from '@nestjs/graphql';

import { ASSIGNMENT_STATE } from 'src/shared/enums';
import { BasePagingRequest, BasePagingResponse } from 'src/shared/generics';
import { Assignment } from '../entities/assignment.entity';

@InputType()
export class FindAssignmentsInput extends BasePagingRequest {
  @Field(() => [String], { nullable: true })
  state: ASSIGNMENT_STATE[];

  @Field(() => String, { nullable: true, defaultValue: 'assetName' })
  sort: string;

  @Field({ nullable: true })
  assignedDate: string;
}

@ObjectType()
export class FindAssignmentsOutput extends BasePagingResponse {
  @Field(() => [Assignment])
  assignments: Assignment[];
}
