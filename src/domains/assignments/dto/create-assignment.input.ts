import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateAssignmentInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
